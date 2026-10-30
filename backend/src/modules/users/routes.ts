import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { createRequireAuth } from '../../middleware/requireAuth.js';
import { changeUserPassword, updateUserProfile } from '../../services/userService.js';
import { changePasswordBodySchema, patchUserBodySchema } from './schemas.js';

export async function userRoutes(app: FastifyInstance, opts: { env: Env }) {
  const requireAuth = createRequireAuth(opts.env);

  app.addHook('preHandler', requireAuth);

  app.patch('/api/users/me', async (request) => {
    const parsed = patchUserBodySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }
    const user = await updateUserProfile(request.user!.id, parsed.data);
    return { user };
  });

  app.post('/api/users/me/password', async (request, reply) => {
    const parsed = changePasswordBodySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', {
        issues: parsed.error.flatten(),
      });
    }
    await changeUserPassword(
      request.user!.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
    return reply.status(204).send();
  });
}
