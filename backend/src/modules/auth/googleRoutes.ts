import { randomBytes } from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import type { Env } from '../../config/env.js';
import { prisma } from '../../lib/db.js';
import { createSession, setSessionCookie } from '../../services/sessionService.js';

const OAUTH_STATE_COOKIE = 'oauth_state';
const OAUTH_POPUP_COOKIE = 'oauth_popup';

function isGoogleConfigured(env: Env): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID.trim() && env.GOOGLE_CLIENT_SECRET.trim());
}

function callbackUrl(env: Env): string {
  return env.GOOGLE_CALLBACK_URL ?? `http://localhost:${env.PORT}/api/auth/google/callback`;
}

function oauthClient(env: Env): OAuth2Client {
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, callbackUrl(env));
}

function queryPopupFlag(request: FastifyRequest): boolean {
  const query = request.query as { popup?: string };
  return query.popup === '1' || query.popup === 'true';
}

function isPopupFlow(request: FastifyRequest): boolean {
  if (queryPopupFlag(request)) return true;
  const cookie = request.cookies[OAUTH_POPUP_COOKIE];
  const unsigned = request.unsignCookie(cookie ?? '');
  return unsigned.valid && unsigned.value === '1';
}

function clearOAuthFlowCookies(reply: FastifyReply) {
  reply.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });
  reply.clearCookie(OAUTH_POPUP_COOKIE, { path: '/' });
}

function redirectLoginError(env: Env, reply: FastifyReply, request: FastifyRequest, reason?: string) {
  const query = reason ? `?oauth=error&reason=${encodeURIComponent(reason)}` : '?oauth=error';
  if (isPopupFlow(request)) {
    clearOAuthFlowCookies(reply);
    return reply.redirect(`${env.FRONTEND_URL}/#/auth/google-popup${query}`, 302);
  }
  return reply.redirect(`${env.FRONTEND_URL}/#/login${query}`, 302);
}

function redirectLoginSuccess(env: Env, reply: FastifyReply, request: FastifyRequest) {
  if (isPopupFlow(request)) {
    clearOAuthFlowCookies(reply);
    return reply.redirect(`${env.FRONTEND_URL}/#/auth/google-popup?success=1`, 302);
  }
  return reply.redirect(`${env.FRONTEND_URL}/#/app`, 302);
}

export async function googleAuthRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts;

  app.get('/api/auth/google', async (request, reply) => {
    const popup = queryPopupFlag(request);

    if (!isGoogleConfigured(env)) {
      redirectLoginError(env, reply, request, 'not_configured');
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

    if (popup) {
      reply.setCookie(OAUTH_POPUP_COOKIE, '1', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        signed: true,
        maxAge: 600,
      });
    }

    return reply.redirect(url, 302);
  });

  app.get('/api/auth/google/callback', async (request, reply) => {
    if (!isGoogleConfigured(env)) {
      redirectLoginError(env, reply, request, 'not_configured');
      return;
    }

    const query = request.query as { code?: string; state?: string; error?: string };
    if (query.error) {
      redirectLoginError(env, reply, request, query.error);
      return;
    }

    const stateCookie = request.cookies[OAUTH_STATE_COOKIE];
    const unsigned = request.unsignCookie(stateCookie ?? '');
    reply.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

    if (!query.state || !unsigned.valid || unsigned.value !== query.state) {
      redirectLoginError(env, reply, request, 'invalid_state');
      return;
    }

    if (!query.code) {
      redirectLoginError(env, reply, request, 'missing_code');
      return;
    }

    try {
      const client = oauthClient(env);
      const { tokens } = await client.getToken(query.code);
      if (!tokens.id_token) {
        redirectLoginError(env, reply, request, 'missing_id_token');
        return;
      }

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        redirectLoginError(env, reply, request, 'invalid_profile');
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
      return redirectLoginSuccess(env, reply, request);
    } catch {
      redirectLoginError(env, reply, request, 'exchange_failed');
    }
  });
}
