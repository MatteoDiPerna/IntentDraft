import { randomBytes } from 'node:crypto';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import type { Env } from '../../config/env.js';
import { prisma } from '../../lib/db.js';
import { createSession, setSessionCookie } from '../../services/sessionService.js';

const OAUTH_STATE_COOKIE = 'oauth_state';

function isGoogleConfigured(env: Env): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID.trim() && env.GOOGLE_CLIENT_SECRET.trim());
}

function callbackUrl(env: Env): string {
  return env.GOOGLE_CALLBACK_URL ?? `http://localhost:${env.PORT}/api/auth/google/callback`;
}

function oauthClient(env: Env): OAuth2Client {
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, callbackUrl(env));
}

function redirectLoginError(env: Env, reply: FastifyReply, reason?: string) {
  const query = reason ? `?oauth=error&reason=${encodeURIComponent(reason)}` : '?oauth=error';
  return reply.redirect(`${env.FRONTEND_URL}/#/login${query}`, 302);
}

export async function googleAuthRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts;

  app.get('/api/auth/google', async (_request, reply) => {
    if (!isGoogleConfigured(env)) {
      redirectLoginError(env, reply, 'not_configured');
      return;
    }

    const state = randomBytes(16).toString('hex');
    const client = oauthClient(env);
    const url = client.generateAuthUrl({
      access_type: 'online',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
    });

    reply.setCookie(OAUTH_STATE_COOKIE, state, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      signed: true,
      maxAge: 600,
    });

    return reply.redirect(url, 302);
  });

  app.get('/api/auth/google/callback', async (request, reply) => {
    if (!isGoogleConfigured(env)) {
      redirectLoginError(env, reply, 'not_configured');
      return;
    }

    const query = request.query as { code?: string; state?: string; error?: string };
    if (query.error) {
      redirectLoginError(env, reply, query.error);
      return;
    }

    const stateCookie = request.cookies[OAUTH_STATE_COOKIE];
    const unsigned = request.unsignCookie(stateCookie ?? '');
    reply.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

    if (!query.state || !unsigned.valid || unsigned.value !== query.state) {
      redirectLoginError(env, reply, 'invalid_state');
      return;
    }

    if (!query.code) {
      redirectLoginError(env, reply, 'missing_code');
      return;
    }

    try {
      const client = oauthClient(env);
      const { tokens } = await client.getToken(query.code);
      if (!tokens.id_token) {
        redirectLoginError(env, reply, 'missing_id_token');
        return;
      }

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        redirectLoginError(env, reply, 'invalid_profile');
        return;
      }

      const email = payload.email.toLowerCase();
      const googleSub = payload.sub;
      const displayName = payload.name?.trim() || email.split('@')[0] || 'User';

      let user = await prisma.user.findFirst({
        where: { OR: [{ googleSub }, { email }] },
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleSub,
            authProvider: 'google',
            displayName: user.displayName || displayName,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            googleSub,
            authProvider: 'google',
            displayName,
            passwordHash: null,
          },
        });
      }

      const sessionId = await createSession(user.id, env);
      setSessionCookie(reply, env, sessionId);
      return reply.redirect(`${env.FRONTEND_URL}/#/app`, 302);
    } catch {
      redirectLoginError(env, reply, 'exchange_failed');
    }
  });
}
