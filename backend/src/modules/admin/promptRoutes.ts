import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { adminDryRun } from './services/dryRunService.js';
import { listPromptTemplates, upsertPromptTemplate } from './services/promptAdminService.js';
import { dryRunBodySchema, putPromptTemplateBodySchema } from './schemas.js';

export async function registerAdminPromptRoutes(app: FastifyInstance, opts: { env: Env }) {
  app.get('/prompt-templates', async () => listPromptTemplates());

  app.put('/prompt-templates/:key', async (request) => {
    const { key } = request.params as { key: string };
    const parsed = putPromptTemplateBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid body', {
        issues: parsed.error.flatten(),
      });
    }
    const adminId = request.user!.id;
    return upsertPromptTemplate(adminId, key, parsed.data);
  });

  app.post('/prompt-templates/dry-run', async (request) => {
    const parsed = dryRunBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid body', {
        issues: parsed.error.flatten(),
      });
    }
    return adminDryRun(opts.env, parsed.data.userText, parsed.data.locale);
  });
}
