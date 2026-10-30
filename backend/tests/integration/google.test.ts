import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/app.js';
import { prisma } from '../../src/lib/db.js';

describe('google OAuth routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const server = await buildServer();
    app = server.app;
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('redirects to login error when Google is not configured', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/google' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('oauth=error');
  });
});
