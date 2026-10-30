import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { createRequireAuth } from '../../middleware/requireAuth.js';
import { conversationIdParamSchema } from '../conversations/schemas.js';
import {
  getLatestPrompt,
  submitPromptFeedback,
  updatePromptBody,
} from '../../services/promptService.js';
import { promptFeedbackBodySchema, promptIdParamSchema, putPromptBodySchema } from './schemas.js';

export async function promptRoutes(app: FastifyInstance, opts: { env: Env }) {
  const requireAuth = createRequireAuth(opts.env);

  app.addHook('preHandler', requireAuth);

  app.get('/api/conversations/:id/prompts/latest', async (request) => {
    const params = conversationIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid conversation id');
    }
    return getLatestPrompt(request.user!.id, params.data.id);
  });

  app.put('/api/prompts/:id', async (request) => {
    const params = promptIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid prompt id');
    }
    const parsed = putPromptBodySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }
    return updatePromptBody(request.user!.id, params.data.id, parsed.data.bodyMarkdown);
  });

  app.post('/api/prompts/:id/feedback', async (request, reply) => {
    const params = promptIdParamSchema.safeParse(request.params);
    if (!params.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid prompt id');
    }
    const parsed = promptFeedbackBodySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }
    await submitPromptFeedback(request.user!.id, params.data.id, parsed.data.useful);
    return reply.status(204).send();
  });
}
