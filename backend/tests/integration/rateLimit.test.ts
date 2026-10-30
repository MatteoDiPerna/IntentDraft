import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { Env } from '../../src/config/env.js';
import { buildServer } from '../../src/app.js';
import { loadEnv, resetEnvCache } from '../../src/config/env.js';
import { prisma } from '../../src/lib/db.js';

function testEnvWithRateLimit(base: Env): Env {
  return {
    ...base,
    NODE_ENV: 'development',
    RATE_LIMIT_ENABLED: true,
    RATE_LIMIT_AUTH_MAX: 3,
    RATE_LIMIT_AUTH_WINDOW_MS: 60_000,
  };
}

describe('rate limit (auth)', () => {
  let app: FastifyInstance;
  let baseEnv: Env;

  beforeAll(async () => {
    resetEnvCache();
    baseEnv = loadEnv();
    const server = await buildServer({ env: testEnvWithRateLimit(baseEnv) });
    app = server.app;
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    resetEnvCache();
    await prisma.$disconnect();
  });

  it('returns 429 after auth route budget exceeded (NFR-003)', async () => {
    const body = { email: 'rate-limit@example.com', password: 'wrong-password-123' };
    for (let i = 0; i < 3; i++) {
      const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: body });
      expect(res.statusCode).not.toBe(429);
    }
    const blocked = await app.inject({ method: 'POST', url: '/api/auth/login', payload: body });
    expect(blocked.statusCode).toBe(429);
    const json = blocked.json() as { error: { code: string } };
    expect(json.error.code).toBe('RATE_LIMITED');
  });
});
