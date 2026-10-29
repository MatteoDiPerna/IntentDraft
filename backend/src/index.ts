import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { loadEnv } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './modules/health/routes.js';
import { logger } from './lib/logger.js';
import { AppError, errorPayload } from './lib/errors.js';

async function buildServer() {
  const env = loadEnv();

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

  return { app, env };
}

async function main() {
  const { app, env } = await buildServer();
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info('API listening', { port: env.PORT, corsOrigin: env.CORS_ORIGIN });
}

main().catch((err) => {
  logger.error('Failed to start', { message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});

export { buildServer };
