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

describe.skipIf(!hasDb)('prompts API', () => {
  let app: FastifyInstance;
  const email = `prompt-${Date.now()}@test.intentdraft.local`;
  const password = 'testpass1';
  let cookie = '';
  let conversationId = '';
  let promptId = '';

  beforeAll(async () => {
    const server = await buildServer();
    app = server.app;
    await app.ready();

    const reg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email, password, displayName: 'Prompt Test' },
    });
    cookie = cookieHeader(reg.headers['set-cookie']);
    const userId = (reg.json() as { user: { id: string } }).user.id;

    const create = await app.inject({
      method: 'POST',
      url: '/api/conversations',
      headers: { cookie },
      payload: {},
    });
    conversationId = (create.json() as { conversation: { id: string } }).conversation.id;

    const prompt = await prisma.promptArtifact.create({
      data: {
        conversationId,
        bodyMarkdown: '# Prompt v1',
        version: 1,
      },
    });
    promptId = prompt.id;
    void userId;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
    await prisma.$disconnect();
  });

  it('GET latest, PUT body, POST feedback', async () => {
    const latest = await app.inject({
      method: 'GET',
      url: `/api/conversations/${conversationId}/prompts/latest`,
      headers: { cookie },
    });
    expect(latest.statusCode).toBe(200);
    expect((latest.json() as { id: string }).id).toBe(promptId);

    const put = await app.inject({
      method: 'PUT',
      url: `/api/prompts/${promptId}`,
      headers: { cookie },
      payload: { bodyMarkdown: '# Prompt edited' },
    });
    expect(put.statusCode).toBe(200);
    expect((put.json() as { bodyMarkdown: string }).bodyMarkdown).toBe('# Prompt edited');

    const feedback = await app.inject({
      method: 'POST',
      url: `/api/prompts/${promptId}/feedback`,
      headers: { cookie },
      payload: { useful: true },
    });
    expect(feedback.statusCode).toBe(204);

    const row = await prisma.promptArtifact.findUnique({ where: { id: promptId } });
    expect(row?.feedback).toBe('useful');
  });

  it('regenerate requires interpretation in ai_state', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/conversations/${conversationId}/regenerate`,
      headers: { cookie },
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });
});
