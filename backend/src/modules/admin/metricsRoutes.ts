import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { buildMetricsOverview } from './services/metricsService.js';
import { metricsOverviewQuerySchema } from './schemas.js';

export async function registerAdminMetricsRoutes(app: FastifyInstance, opts: { env: Env }) {
  app.get('/metrics/overview', async (request) => {
    const parsed = metricsOverviewQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid query', {
        issues: parsed.error.flatten(),
      });
    }
    return buildMetricsOverview(opts.env, parsed.data.days ?? 7);
  });
}
