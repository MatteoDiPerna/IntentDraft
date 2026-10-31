import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../lib/errors.js';
import { getLegalPage } from '../admin/services/complianceService.js';

const publicLegalQuerySchema = z.object({
  page: z.enum(['limits', 'privacy', 'terms']).default('limits'),
  locale: z.enum(['it', 'en']).default('it'),
});

export async function publicRoutes(app: FastifyInstance) {
  app.get('/api/public/legal', async (request) => {
    const parsed = publicLegalQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid query', {
        issues: parsed.error.flatten(),
      });
    }
    const markdown = await getLegalPage(parsed.data.page, parsed.data.locale);
    return { page: parsed.data.page, locale: parsed.data.locale, markdown };
  });
}
