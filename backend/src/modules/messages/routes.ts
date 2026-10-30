import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import type { Locale } from '../auth/userDto.js';
import { AppError } from '../../lib/errors.js';
import { createRequireAuth } from '../../middleware/requireAuth.js';
import {
  orchestrateRegenerate,
  orchestrateSendMessage,
  orchestrateSkipClarification,
} from '../../services/conversationOrchestrator.js';
import { conversationIdParamSchema } from '../conversations/schemas.js';
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
    const result = await orchestrateSendMessage(
      request.user!.id,
      params.data.id,
      parsed.data.content,
      locale,
      parsed.data.attachments,
    );

    return reply.status(201).send(result);
  });

  app.post('/api/conversations/:id/regenerate', async (request, reply) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }
    const locale = (request.user!.locale ?? 'it') as Locale;
    const result = await orchestrateRegenerate(request.user!.id, params.data.id, locale);
    return reply.status(200).send(result);
  });

  app.post('/api/conversations/:id/skip-clarification', async (request, reply) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }
    const locale = (request.user!.locale ?? 'it') as Locale;
    const result = await orchestrateSkipClarification(request.user!.id, params.data.id, locale);
    return reply.status(200).send(result);
  });
}
