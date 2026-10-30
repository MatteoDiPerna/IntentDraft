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

function multipartBody(filename: string, content: string, boundary = '----IntentDraftTest') {
  return [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${filename}"`,
    'Content-Type: text/plain',
    '',
    content,
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

describe.skipIf(!hasDb)('files API', () => {
  let app: FastifyInstance;
  const email = `file-${Date.now()}@test.intentdraft.local`;
  const password = 'testpass1';
  let cookie = '';
  let conversationId = '';
  let fileId = '';

  beforeAll(async () => {
    const server = await buildServer();
    app = server.app;
    await app.ready();

    const reg = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email, password, displayName: 'File Test' },
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

  it('upload → list → download → delete (T-FILE-01)', async () => {
    const boundary = '----IntentDraftTest';
    const upload = await app.inject({
      method: 'POST',
      url: `/api/conversations/${conversationId}/files`,
      headers: {
        cookie,
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      payload: multipartBody('note.txt', 'hello file content', boundary),
    });
    expect(upload.statusCode).toBe(201);
    const uploaded = upload.json() as { file: { id: string; originalName: string } };
    fileId = uploaded.file.id;
    expect(uploaded.file.originalName).toBe('note.txt');

    const list = await app.inject({
      method: 'GET',
      url: `/api/conversations/${conversationId}/files`,
      headers: { cookie },
    });
    expect(list.statusCode).toBe(200);
    const items = (list.json() as { items: { id: string }[] }).items;
    expect(items.some((i) => i.id === fileId)).toBe(true);

    const download = await app.inject({
      method: 'GET',
      url: `/api/files/${fileId}/download`,
      headers: { cookie },
    });
    expect(download.statusCode).toBe(200);
    expect(download.body).toContain('hello file content');

    const del = await app.inject({
      method: 'DELETE',
      url: `/api/files/${fileId}`,
      headers: { cookie },
    });
    expect(del.statusCode).toBe(204);

    const row = await prisma.uploadedFile.findUnique({ where: { id: fileId } });
    expect(row).toBeNull();
  });
});
