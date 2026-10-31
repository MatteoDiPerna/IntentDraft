import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { z } from 'zod';
import { AppError } from '../../lib/errors.js';
import { recordCookieConsent } from '../admin/services/complianceService.js';
import { resolveUserFromRequest } from '../../services/sessionService.js';

const cookieConsentSchema = z.object({
  choice: z.enum(['accepted', 'rejected']),
});

export async function consentRoutes(app: FastifyInstance, opts: { env: Env }) {
  app.post('/api/consent/cookie', async (request) => {
    const parsed = cookieConsentSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }
    const dbUser = await resolveUserFromRequest(request, opts.env);
    return recordCookieConsent(dbUser?.id ?? null, parsed.data.choice);
  });
}
