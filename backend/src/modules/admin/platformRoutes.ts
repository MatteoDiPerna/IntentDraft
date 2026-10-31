import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { getPlatformSettings, putPlatformSettings } from './services/platformService.js';
import { putPlatformSettingsBodySchema } from './schemas.js';

export async function registerAdminPlatformRoutes(app: FastifyInstance, opts: { env: Env }) {
  app.get('/platform/settings', async () => getPlatformSettings(opts.env));

  app.put('/platform/settings', async (request) => {
    const parsed = putPlatformSettingsBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid body', {
        issues: parsed.error.flatten(),
      });
    }
    const adminId = request.user!.id;
    return putPlatformSettings(adminId, parsed.data);
  });
}
