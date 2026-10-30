import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { sanitizeOriginalName } from '../../lib/filePolicy.js';
import { createRequireAuth } from '../../middleware/requireAuth.js';
import { conversationIdParamSchema } from '../conversations/schemas.js';
import {
  deleteOwnedFile,
  listConversationFiles,
  openOwnedFileStream,
  uploadConversationFile,
} from '../../services/fileService.js';
import { z } from 'zod';

const fileIdParamSchema = z.object({
  id: z.string().uuid(),
});

export async function fileRoutes(app: FastifyInstance, opts: { env: Env }) {
  const requireAuth = createRequireAuth(opts.env);
  const { env } = opts;

  app.addHook('preHandler', requireAuth);

  app.post('/api/conversations/:id/files', async (request, reply) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }

    let messageId: string | undefined;
    let uploadBuffer: Buffer | null = null;
    let mimeType = 'application/octet-stream';
    let originalName = 'file';

    const parts = request.parts();
    for await (const part of parts) {
      if (part.type === 'file') {
        const field = part.fieldname;
        if (field !== 'file' && field !== 'files') continue;
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        uploadBuffer = Buffer.concat(chunks);
        mimeType = part.mimetype || mimeType;
        originalName = sanitizeOriginalName(part.filename || originalName);
      } else if (part.type === 'field' && part.fieldname === 'messageId') {
        const value = String(part.value ?? '').trim();
        if (value) messageId = value;
      }
    }

    if (!uploadBuffer || uploadBuffer.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Missing file field');
    }

    if (messageId && !z.string().uuid().safeParse(messageId).success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid messageId');
    }

    const file = await uploadConversationFile(env, request.user!.id, params.data.id, {
      buffer: uploadBuffer,
      mimeType,
      originalName,
      messageId,
    });

    return reply.status(201).send({ file });
  });

  app.get('/api/conversations/:id/files', async (request) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }
    const items = await listConversationFiles(request.user!.id, params.data.id);
    return { items };
  });

  app.delete('/api/files/:id', async (request, reply) => {
    const params = fileIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid file id');
    }
    await deleteOwnedFile(env, request.user!.id, params.data.id);
    return reply.status(204).send();
  });

  app.get('/api/files/:id/download', async (request, reply) => {
    const params = fileIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid file id');
    }

    const { file, stream } = await openOwnedFileStream(env, request.user!.id, params.data.id);
    const encoded = encodeURIComponent(file.originalName);
    reply.header('Content-Type', file.mimeType);
    reply.header('Content-Disposition', `inline; filename="${file.originalName}"; filename*=UTF-8''${encoded}`);
    return reply.send(stream);
  });
}
