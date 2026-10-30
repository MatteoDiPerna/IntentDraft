import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/app.js';
import { prisma } from '../../src/lib/db.js';

const hasDb = Boolean(process.env.DATABASE_URL);

function cookieHeader(setCookie: string | string[] | undefined): string {
  if (!setCookie) return '';
  const list = Array.isArray(setCookie) ? setCookie : [setCookie];
  return list.map((c) => c.split(';')[0] ?? '').filter(Boolean).join('; ');
}

describe.skipIf(!hasDb)('users API', () => {
  let app: FastifyInstance;
  const email = `user-${Date.now()}@test.intentdraft.local`;
  const password = 'testpass1';
  const newPassword = 'testpass2';
  let cookie = '';

  beforeAll(async () => {
    const server = await buildServer();
    app = server.app;
    await app.ready();

    const reg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email, password, displayName: 'Before' },
    });
    cookie = cookieHeader(reg.headers['set-cookie']);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
    await prisma.$disconnect();
  });

  it('PATCH /api/users/me updates profile', async () => {
    const patch = await app.inject({
      method: 'PATCH',
      url: '/api/users/me',
      headers: { cookie },
      payload: { displayName: 'After Name', locale: 'en' },
    });
    expect(patch.statusCode).toBe(200);
    const body = patch.json() as { user: { displayName: string; locale: string } };
    expect(body.user.displayName).toBe('After Name');
    expect(body.user.locale).toBe('en');
  });

  it('POST /api/users/me/password changes password', async () => {
    const change = await app.inject({
      method: 'POST',
      url: '/api/users/me/password',
      headers: { cookie },
      payload: { currentPassword: password, newPassword },
    });
    expect(change.statusCode).toBe(204);

    const loginOld = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password },
    });
    expect(loginOld.statusCode).toBe(401);

    const loginNew = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password: newPassword },
    });
    expect(loginNew.statusCode).toBe(200);
  });
});
