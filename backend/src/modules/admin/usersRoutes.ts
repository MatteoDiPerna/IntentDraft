import type { FastifyInstance } from 'fastify';
import type { Env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import {
  forcePasswordReset,
  getAdminUserDetail,
  listAdminUsers,
  patchAdminUser,
} from './services/userAdminService.js';
import { usageByUser } from './services/usageService.js';
import { listUsersQuerySchema, patchUserBodySchema, usageRangeQuerySchema } from './schemas.js';

export async function registerAdminUserRoutes(app: FastifyInstance, opts: { env: Env }) {
  app.get('/users', async (request) => {
    const parsed = listUsersQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid query', {
        issues: parsed.error.flatten(),
      });
    }
    return listAdminUsers(parsed.data);
  });

  app.get('/users/:id', async (request) => {
    const { id } = request.params as { id: string };
    return getAdminUserDetail(id);
  });

  app.patch('/users/:id', async (request) => {
    const { id } = request.params as { id: string };
    const parsed = patchUserBodySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid body', {
        issues: parsed.error.flatten(),
      });
    }
    if (!parsed.data.role && !parsed.data.status) {
      throw new AppError(400, 'VALIDATION_ERROR', 'No fields to update');
    }
    const adminId = request.user!.id;
    return patchAdminUser(adminId, id, parsed.data);
  });

  app.post('/users/:id/force-password-reset', async (request) => {
    const { id } = request.params as { id: string };
    const adminId = request.user!.id;
    return forcePasswordReset(adminId, id, opts.env);
  });

  app.get('/users/:id/usage', async (request) => {
    const { id } = request.params as { id: string };
    const parsed = usageRangeQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid query', {
        issues: parsed.error.flatten(),
      });
    }
    return usageByUser(id, parsed.data.from, parsed.data.to);
  });
}
