import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/app.js';
import { resetEnvCache } from '../../src/config/env.js';
import { prisma } from '../../src/lib/db.js';

async function readyApp(): Promise<FastifyInstance> {
  const server = await buildServer();
  const app = server.app;
  await app.ready();
  return app;
}

describe('google OAuth routes (not configured)', () => {
  let app: FastifyInstance;
  const prevId = process.env.GOOGLE_CLIENT_ID;
  const prevSecret = process.env.GOOGLE_CLIENT_SECRET;

  beforeAll(async () => {
    process.env.GOOGLE_CLIENT_ID = '';
    process.env.GOOGLE_CLIENT_SECRET = '';
    resetEnvCache();
    app = await readyApp();
  });

  afterAll(async () => {
    await app.close();
    process.env.GOOGLE_CLIENT_ID = prevId;
    process.env.GOOGLE_CLIENT_SECRET = prevSecret;
    resetEnvCache();
    await prisma.$disconnect();
  });

  it('redirects to login error when Google is not configured', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/google' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('oauth=error');
    expect(res.headers.location).toContain('/#/login');
  });

  it('redirects popup flow to google-popup when Google is not configured', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/auth/google?popup=1' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('/#/auth/google-popup');
    expect(res.headers.location).toContain('oauth=error');
  });
});

describe('google OAuth routes (configured)', () => {
  let app: FastifyInstance;
  const configured = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );

  beforeAll(async () => {
    if (!configured) return;
    resetEnvCache();
    app = await readyApp();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (!configured) await prisma.$disconnect();
  });

  it('redirects to Google and sets popup cookie when popup=1', async () => {
    if (!configured) return;
    const res = await app.inject({ method: 'GET', url: '/api/auth/google?popup=1' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('accounts.google.com');
    const cookies = res.headers['set-cookie'];
    const joined = Array.isArray(cookies) ? cookies.join(';') : String(cookies ?? '');
    expect(joined).toMatch(/oauth_popup/i);
  });
});
