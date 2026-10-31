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
  let adminUserId = '';
  let standardUserId = '';

  async function refreshAdminCookie() {
    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: adminEmail, password },
    });
    adminCookie = cookieHeader(login.headers['set-cookie']);
  }

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
    standardUserId = (userReg.json() as { user: { id: string } }).user.id;

    const adminReg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: adminEmail, password, displayName: 'Admin' },
    });
    const adminBody = adminReg.json() as { user: { id: string } };
    adminUserId = adminBody.user.id;
    await prisma.user.update({ where: { id: adminUserId }, data: { role: 'admin' } });

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

  it('T-ADMIN-02: metrics overview 200 for admin', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/admin/metrics/overview',
      headers: { cookie: adminCookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { users: { total: number }; system: { filesRejected: number } };
    expect(body.users.total).toBeGreaterThanOrEqual(2);
    expect(typeof body.system.filesRejected).toBe('number');
  });

  it('T-ADMIN-03: LAST_ADMIN when demoting sole admin', async () => {
    const admin2Email = `admin-second-${Date.now()}@test.intentdraft.local`;
    const reg2 = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: admin2Email, password, displayName: 'Admin Two' },
    });
    const admin2Id = (reg2.json() as { user: { id: string } }).user.id;
    await prisma.user.update({ where: { id: admin2Id }, data: { role: 'admin' } });

    const demoteSecond = await app.inject({
      method: 'PATCH',
      url: `/api/admin/users/${admin2Id}`,
      headers: { cookie: adminCookie },
      payload: { role: 'user' },
    });
    expect(demoteSecond.statusCode).toBe(200);

    const adminsAfterSecond = await prisma.user.count({
      where: { role: 'admin', status: 'active' },
    });
    const demoteLast = await app.inject({
      method: 'PATCH',
      url: `/api/admin/users/${adminUserId}`,
      headers: { cookie: adminCookie },
      payload: { role: 'user' },
    });
    if (adminsAfterSecond === 1) {
      expect(demoteLast.statusCode).toBe(409);
      expect((demoteLast.json() as { error: { code: string } }).error.code).toBe('LAST_ADMIN');
    } else {
      expect(demoteLast.statusCode).toBe(200);
    }

    await prisma.user.update({
      where: { id: adminUserId },
      data: { role: 'admin', status: 'active' },
    });
    await refreshAdminCookie();
    await prisma.user.deleteMany({ where: { email: admin2Email } });
  });

  it('T-ADMIN-04: disabled user cannot login', async () => {
    const disable = await app.inject({
      method: 'PATCH',
      url: `/api/admin/users/${standardUserId}`,
      headers: { cookie: adminCookie },
      payload: { status: 'disabled' },
    });
    expect(disable.statusCode).toBe(200);

    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: userEmail, password },
    });
    expect(login.statusCode).toBe(403);
    expect((login.json() as { error: { code: string } }).error.code).toBe('ACCOUNT_DISABLED');
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

  it('public legal returns markdown after admin save', async () => {
    const put = await app.inject({
      method: 'PUT',
      url: '/api/admin/compliance/legal',
      headers: { cookie: adminCookie },
      payload: { page: 'limits', locale: 'it', markdown: '# Limiti test\n\nContenuto.' },
    });
    expect(put.statusCode).toBe(200);

    const pub = await app.inject({
      method: 'GET',
      url: '/api/public/legal?page=limits&locale=it',
    });
    expect(pub.statusCode).toBe(200);
    const body = pub.json() as { markdown: string };
    expect(body.markdown).toContain('Limiti test');
  });
});
