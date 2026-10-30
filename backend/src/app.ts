import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { loadEnv } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './modules/auth/routes.js';
import { conversationRoutes } from './modules/conversations/routes.js';
import { messageRoutes } from './modules/messages/routes.js';
import { fileRoutes } from './modules/files/routes.js';
import { promptRoutes } from './modules/prompts/routes.js';
import { userRoutes } from './modules/users/routes.js';
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

  await app.register(multipart, {
    limits: { fileSize: env.MAX_UPLOAD_BYTES },
  });

  app.setErrorHandler(errorHandler);

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send(errorPayload(new AppError(404, 'NOT_FOUND', 'Route not found')));
  });

  await app.register(healthRoutes);
  await app.register(authRoutes, { env });
  await app.register(conversationRoutes, { env });
  await app.register(messageRoutes, { env });
  await app.register(fileRoutes, { env });
  await app.register(userRoutes, { env });
  await app.register(promptRoutes, { env });

  return { app, env };
}
