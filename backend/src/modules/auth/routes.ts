import type { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import type { Env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { prisma } from '../../lib/db.js';
import { hashPassword, verifyPassword } from '../../services/passwordService.js';
import {
  clearSessionCookie,
  createSession,
  logoutRequest,
  resolveUserFromRequest,
  setSessionCookie,
} from '../../services/sessionService.js';
import { loginBodySchema, registerBodySchema } from './schemas.js';
import { toUserDto } from './userMapper.js';

export async function authRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts;

  app.post('/api/auth/register', async (request, reply) => {
    const parsed = registerBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const displayName = parsed.data.displayName?.trim() || email.split('@')[0] || 'User';
    const passwordHash = await hashPassword(parsed.data.password);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          authProvider: 'local',
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError(409, 'EMAIL_TAKEN', 'Email already registered');
      }
      throw err;
    }

    const sessionId = await createSession(user.id, env);
    setSessionCookie(reply, env, sessionId);
    return reply.status(201).send({ user: toUserDto(user) });
  });

  app.post('/api/auth/login', async (request, reply) => {
    const parsed = loginBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user && (await verifyPassword(parsed.data.password, user.passwordHash));
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const sessionId = await createSession(user.id, env);
    setSessionCookie(reply, env, sessionId);
    return reply.send({ user: toUserDto(user) });
  });

  app.post('/api/auth/logout', async (request, reply) => {
    await logoutRequest(request, env);
    clearSessionCookie(reply, env);
    return reply.status(204).send();
  });

  app.get('/api/auth/me', async (request, reply) => {
    const dbUser = await resolveUserFromRequest(request, env);
    if (!dbUser) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    return reply.send({ user: toUserDto(dbUser) });
  });
}
