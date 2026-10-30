import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import type { Env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

export type RateLimitScope = 'auth' | 'messages';

export async function registerScopeRateLimit(
  app: FastifyInstance,
  env: Env,
  scope: RateLimitScope,
): Promise<void> {
  if (!env.RATE_LIMIT_ENABLED) return;

  const max = scope === 'auth' ? env.RATE_LIMIT_AUTH_MAX : env.RATE_LIMIT_MESSAGES_MAX;
  const timeWindow =
    scope === 'auth' ? env.RATE_LIMIT_AUTH_WINDOW_MS : env.RATE_LIMIT_MESSAGES_WINDOW_MS;

  await app.register(rateLimit, {
    max,
    timeWindow,
    hook: 'preHandler',
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (_request, context) =>
      new AppError(429, 'RATE_LIMITED', 'Too many requests. Please try again later.', {
        retryAfterMs: context.ttl,
      }),
  });
}
