import type { FastifyInstance } from 'fastify';
import { AppError } from '../../lib/errors.js';
import { exportUsageCsv } from './services/usageService.js';
import { usageExportQuerySchema } from './schemas.js';

export async function registerAdminUsageRoutes(app: FastifyInstance) {
  app.get('/usage/export', async (request, reply) => {
    const parsed = usageExportQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid query', {
        issues: parsed.error.flatten(),
      });
    }
    const csv = await exportUsageCsv(parsed.data.from, parsed.data.to);
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', 'attachment; filename="llm-usage.csv"');
    return reply.send(csv);
  });
}
