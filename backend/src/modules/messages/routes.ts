import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import type { Locale } from '../auth/userDto.js';
import { AppError } from '../../lib/errors.js';
import { createRequireAuth } from '../../middleware/requireAuth.js';
import { conversationIdParamSchema } from '../conversations/schemas.js';
import { sendStubMessage } from '../../services/messageService.js';
import { createSendMessageBodySchema } from './schemas.js';

export async function messageRoutes(app: FastifyInstance, opts: { env: Env }) {
  const requireAuth = createRequireAuth(opts.env);
  const sendMessageBodySchema = createSendMessageBodySchema(opts.env.MAX_MESSAGE_CHARS);

  app.addHook('preHandler', requireAuth);

  app.post('/api/conversations/:id/messages', async (request, reply) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }

    const parsed = sendMessageBodySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }

    const locale = (request.user!.locale ?? 'it') as Locale;
    const result = await sendStubMessage(
      request.user!.id,
      params.data.id,
      parsed.data.content,
      locale,
      { attachmentIds: parsed.data.attachments },
    );

    return reply.status(201).send(result);
  });

  app.post('/api/conversations/:id/regenerate', async (request) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }
    throw new AppError(
      501,
      'NOT_IMPLEMENTED',
      'Prompt regeneration requires the conversation engine (B7)',
    );
  });

  app.post('/api/conversations/:id/skip-clarification', async (request, reply) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }
    void request.user;
    void params.data.id;
    return reply.status(204).send();
  });
}
