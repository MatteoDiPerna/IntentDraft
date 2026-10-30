import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { createRequireAuth } from '../../middleware/requireAuth.js';
import {
  createConversation,
  deleteConversation,
  getConversationOwned,
  listConversationsForUser,
  patchConversation,
} from '../../services/conversationService.js';
import {
  toConversationDetailDto,
  toConversationSummaryDto,
} from './mappers.js';
import {
  conversationIdParamSchema,
  createConversationBodySchema,
  patchConversationBodySchema,
} from './schemas.js';

export async function conversationRoutes(app: FastifyInstance, opts: { env: Env }) {
  const requireAuth = createRequireAuth(opts.env);

  app.addHook('preHandler', requireAuth);

  app.get('/api/conversations', async (request) => {
    const userId = request.user!.id;
    const rows = await listConversationsForUser(userId);
    return {
      items: rows.map(({ conversation, latestMessage }) =>
        toConversationSummaryDto(conversation, latestMessage),
      ),
    };
  });

  app.post('/api/conversations', async (request, reply) => {
    const parsed = createConversationBodySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }

    const conv = await createConversation(request.user!.id, parsed.data.title);
    return reply.status(201).send({ conversation: toConversationSummaryDto(conv) });
  });

  app.get('/api/conversations/:id', async (request) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }

    const conv = await getConversationOwned(request.user!.id, params.data.id);
    const latestPrompt = conv.promptArtifacts[0] ?? null;
    const latestMessage = conv.messages[conv.messages.length - 1];

    return toConversationDetailDto(
      conv,
      conv.messages,
      conv.uploadedFiles,
      latestPrompt,
      latestMessage,
    );
  });

  app.patch('/api/conversations/:id', async (request) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }

    const parsed = patchConversationBodySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }

    const updated = await patchConversation(request.user!.id, params.data.id, parsed.data);
    return toConversationSummaryDto(updated);
  });

  app.delete('/api/conversations/:id', async (request, reply) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }

    await deleteConversation(request.user!.id, params.data.id);
    return reply.status(204).send();
  });
}
