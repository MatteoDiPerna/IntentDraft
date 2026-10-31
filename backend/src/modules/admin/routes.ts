import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { registerAdminComplianceRoutes } from './complianceRoutes.js';
import { registerAdminMetricsRoutes } from './metricsRoutes.js';
import { registerAdminPlatformRoutes } from './platformRoutes.js';
import { registerAdminPromptRoutes } from './promptRoutes.js';
import { registerAdminUsageRoutes } from './usageRoutes.js';
import { registerAdminUserRoutes } from './usersRoutes.js';

export async function adminRoutes(app: FastifyInstance, opts: { env: Env }) {
  app.get('/health', async () => ({ ok: true, admin: true }));

  await registerAdminMetricsRoutes(app, opts);
  await registerAdminUserRoutes(app, opts);
  await registerAdminUsageRoutes(app);
  await registerAdminPromptRoutes(app, opts);
  await registerAdminPlatformRoutes(app, opts);
  await registerAdminComplianceRoutes(app);
}
