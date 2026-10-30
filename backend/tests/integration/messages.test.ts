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

describe.skipIf(!hasDb)('messages API (stub)', () => {
  let app: FastifyInstance;
  const email = `msg-${Date.now()}@test.intentdraft.local`;
  const password = 'testpass1';
  let cookie = '';
  let conversationId = '';

  beforeAll(async () => {
    const server = await buildServer();
    app = server.app;
    await app.ready();

    const reg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email, password, displayName: 'Msg Test' },
    });
    cookie = cookieHeader(reg.headers['set-cookie']);

    const create = await app.inject({
      method: 'POST',
      url: '/api/conversations',
      headers: { cookie },
      payload: {},
    });
    conversationId = (create.json() as { conversation: { id: string } }).conversation.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
    await prisma.$disconnect();
  });

  it('rejects unauthenticated send', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/conversations/${conversationId}/messages`,
      payload: { content: 'Hello' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('persists user + assistant stub and auto-title', async () => {
    const send = await app.inject({
      method: 'POST',
      url: `/api/conversations/${conversationId}/messages`,
      headers: { cookie },
      payload: { content: 'Primo messaggio di test' },
    });
    expect(send.statusCode).toBe(201);
    const body = send.json() as {
      userMessage: { role: string; content: string };
      assistantMessage: { role: string; content: string };
      conversationPhase: string;
    };
    expect(body.userMessage.role).toBe('user');
    expect(body.userMessage.content).toBe('Primo messaggio di test');
    expect(body.assistantMessage.role).toBe('assistant');
    expect(body.assistantMessage.content).toContain('Motore AI');
    expect(body.conversationPhase).toBe('idle');

    const detail = await app.inject({
      method: 'GET',
      url: `/api/conversations/${conversationId}`,
      headers: { cookie },
    });
    const detailBody = detail.json() as { messages: { role: string }[]; title: string };
    expect(detailBody.messages).toHaveLength(2);
    expect(detailBody.title).toBe('Primo messaggio di test');

    const row = await prisma.conversation.findUnique({ where: { id: conversationId } });
    expect(row?.title).toBe('Primo messaggio di test');
    expect(row?.updatedAt).toBeTruthy();
  });

  it('rejects empty content', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/conversations/${conversationId}/messages`,
      headers: { cookie },
      payload: { content: '   ' },
    });
    expect(res.statusCode).toBe(400);
  });
});
