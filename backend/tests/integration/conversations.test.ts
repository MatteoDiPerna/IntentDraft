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

describe.skipIf(!hasDb)('conversations API', () => {
  let app: FastifyInstance;
  const emailA = `conv-a-${Date.now()}@test.intentdraft.local`;
  const emailB = `conv-b-${Date.now()}@test.intentdraft.local`;
  const password = 'testpass1';
  let cookieA = '';
  let cookieB = '';
  let conversationId = '';

  beforeAll(async () => {
    const server = await buildServer();
    app = server.app;
    await app.ready();

    const regA = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: emailA, password, displayName: 'Conv A' },
    });
    cookieA = cookieHeader(regA.headers['set-cookie']);

    const regB = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: emailB, password, displayName: 'Conv B' },
    });
    cookieB = cookieHeader(regB.headers['set-cookie']);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
    await app.close();
    await prisma.$disconnect();
  });

  it('requires auth for list', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/conversations' });
    expect(res.statusCode).toBe(401);
  });

  it('create → list → get → patch → delete', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/api/conversations',
      headers: { cookie: cookieA },
      payload: { title: 'Test chat' },
    });
    expect(create.statusCode).toBe(201);
    const created = create.json() as { conversation: { id: string; title: string } };
    conversationId = created.conversation.id;
    expect(created.conversation.title).toBe('Test chat');

    const list = await app.inject({
      method: 'GET',
      url: '/api/conversations',
      headers: { cookie: cookieA },
    });
    expect(list.statusCode).toBe(200);
    const items = (list.json() as { items: { id: string }[] }).items;
    expect(items.some((i) => i.id === conversationId)).toBe(true);

    const detail = await app.inject({
      method: 'GET',
      url: `/api/conversations/${conversationId}`,
      headers: { cookie: cookieA },
    });
    expect(detail.statusCode).toBe(200);
    const detailBody = detail.json() as { messages: unknown[]; phase: string };
    expect(detailBody.messages).toEqual([]);
    expect(detailBody.phase).toBe('idle');

    const patch = await app.inject({
      method: 'PATCH',
      url: `/api/conversations/${conversationId}`,
      headers: { cookie: cookieA },
      payload: { title: 'Renamed', metadata: { pinned: true } },
    });
    expect(patch.statusCode).toBe(200);
    const patched = patch.json() as { title: string; metadata: { pinned: boolean } };
    expect(patched.title).toBe('Renamed');
    expect(patched.metadata.pinned).toBe(true);

    const del = await app.inject({
      method: 'DELETE',
      url: `/api/conversations/${conversationId}`,
      headers: { cookie: cookieA },
    });
    expect(del.statusCode).toBe(204);

    const gone = await app.inject({
      method: 'GET',
      url: `/api/conversations/${conversationId}`,
      headers: { cookie: cookieA },
    });
    expect(gone.statusCode).toBe(404);
  });

  it('returns 404 for another user conversation', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/api/conversations',
      headers: { cookie: cookieB },
      payload: {},
    });
    const id = (create.json() as { conversation: { id: string } }).conversation.id;

    const peek = await app.inject({
      method: 'GET',
      url: `/api/conversations/${id}`,
      headers: { cookie: cookieA },
    });
    expect(peek.statusCode).toBe(404);
  });
});
