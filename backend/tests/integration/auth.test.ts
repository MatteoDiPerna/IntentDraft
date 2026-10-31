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

describe.skipIf(!hasDb)('auth API', () => {
  let app: FastifyInstance;
  const email = `auth-${Date.now()}@test.intentdraft.local`;
  const password = 'testpass1';

  beforeAll(async () => {
    const server = await buildServer();
    app = server.app;
    await app.ready();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
    await prisma.$disconnect();
  });

  it('register → me → logout → me 401 → login → me', async () => {
    const register = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email, password, displayName: 'Auth Test' },
    });
    expect(register.statusCode).toBe(201);
    const registerBody = register.json() as { user: { email: string; hasPassword: boolean } };
    expect(registerBody.user.email).toBe(email);
    expect(registerBody.user.hasPassword).toBe(true);

    let cookie = cookieHeader(register.headers['set-cookie']);

    const me1 = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie },
    });
    expect(me1.statusCode).toBe(200);

    const logout = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { cookie },
    });
    expect(logout.statusCode).toBe(204);

    const me2 = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie },
    });
    expect(me2.statusCode).toBe(401);
    const err = me2.json() as { error: { code: string } };
    expect(err.error.code).toBe('UNAUTHORIZED');

    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password },
    });
    expect(login.statusCode).toBe(200);
    cookie = cookieHeader(login.headers['set-cookie']);

    const me3 = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie },
    });
    expect(me3.statusCode).toBe(200);
  });

  it('forgot-password rejects unknown email and accepts registered user', async () => {
    const unknown = await app.inject({
      method: 'POST',
      url: '/api/auth/forgot-password',
      payload: { email: 'nobody@intentdraft.local' },
    });
    expect(unknown.statusCode).toBe(404);
    expect((unknown.json() as { error: { code: string } }).error.code).toBe('EMAIL_NOT_REGISTERED');

    const ok = await app.inject({
      method: 'POST',
      url: '/api/auth/forgot-password',
      payload: { email },
    });
    expect(ok.statusCode).toBe(200);
    expect((ok.json() as { ok: boolean }).ok).toBe(true);
  });

  it('rejects duplicate register', async () => {
    const dup = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email, password, displayName: 'Dup' },
    });
    expect(dup.statusCode).toBe(409);
    expect((dup.json() as { error: { code: string } }).error.code).toBe('EMAIL_TAKEN');
  });
});
