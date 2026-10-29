import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { loadEnv } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './modules/auth/routes.js';
import { healthRoutes } from './modules/health/routes.js';
import { AppError, errorPayload } from './lib/errors.js';

export async function buildServer(options?: { env?: ReturnType<typeof loadEnv> }) {
  const env = options?.env ?? loadEnv();

  const app = Fastify({
    logger: false,
    trustProxy: env.NODE_ENV === 'production',
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(cookie, {
    secret: env.SESSION_SECRET,
    hook: 'onRequest',
  });

  app.setErrorHandler(errorHandler);

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send(errorPayload(new AppError(404, 'NOT_FOUND', 'Route not found')));
  });

  await app.register(healthRoutes);
  await app.register(authRoutes, { env });

  return { app, env };
}
