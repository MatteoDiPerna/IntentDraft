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

describe.skipIf(!hasDb)('admin API', () => {
  let app: FastifyInstance;
  const userEmail = `admin-user-${Date.now()}@test.intentdraft.local`;
  const adminEmail = `admin-admin-${Date.now()}@test.intentdraft.local`;
  const password = 'testpass1';
  let userCookie = '';
  let adminCookie = '';

  beforeAll(async () => {
    const server = await buildServer();
    app = server.app;
    await app.ready();

    const userReg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: userEmail, password, displayName: 'User' },
    });
    userCookie = cookieHeader(userReg.headers['set-cookie']);

    const adminReg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: adminEmail, password, displayName: 'Admin' },
    });
    const adminBody = adminReg.json() as { user: { id: string } };
    await prisma.user.update({ where: { id: adminBody.user.id }, data: { role: 'admin' } });

    const adminLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: adminEmail, password },
    });
    adminCookie = cookieHeader(adminLogin.headers['set-cookie']);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [userEmail, adminEmail] } } });
    await app.close();
    await prisma.$disconnect();
  });

  it('T-ADMIN-01: admin health 200, user 403', async () => {
    const forbidden = await app.inject({
      method: 'GET',
      url: '/api/admin/health',
      headers: { cookie: userCookie },
    });
    expect(forbidden.statusCode).toBe(403);
    expect((forbidden.json() as { error: { code: string } }).error.code).toBe('FORBIDDEN');

    const ok = await app.inject({
      method: 'GET',
      url: '/api/admin/health',
      headers: { cookie: adminCookie },
    });
    expect(ok.statusCode).toBe(200);
    expect((ok.json() as { admin: boolean }).admin).toBe(true);
  });

  it('metrics overview for admin', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/metrics/overview',
      headers: { cookie: adminCookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { users: { total: number } };
    expect(body.users.total).toBeGreaterThanOrEqual(2);
  });

  it('usage export returns csv header', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/usage/export?format=csv',
      headers: { cookie: adminCookie },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.body.split('\n')[0]).toBe(
      'date,user_email,phase,model,input_tokens,output_tokens,usd_estimate',
    );
  });
});
