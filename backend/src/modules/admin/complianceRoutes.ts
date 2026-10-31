import type { FastifyInstance } from 'fastify';
import { AppError } from '../../lib/errors.js';
import { getLegalContent, putLegalContent } from './services/complianceService.js';
import { putLegalBodySchema } from './schemas.js';

export async function registerAdminComplianceRoutes(app: FastifyInstance) {
  app.get('/compliance/legal', async () => getLegalContent());

  app.put('/compliance/legal', async (request) => {
    const parsed = putLegalBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid body', {
        issues: parsed.error.flatten(),
      });
    }
    const adminId = request.user!.id;
    try {
      return await putLegalContent(adminId, parsed.data);
    } catch {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid legal page or locale');
    }
  });
}
