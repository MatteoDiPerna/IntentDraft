import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { toUserDto } from '../modules/auth/userMapper.js';
import { resolveUserFromRequest } from '../services/sessionService.js';

export function createRequireAuth(env: Env) {
  return async function requireAuth(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const dbUser = await resolveUserFromRequest(request, env);
    if (!dbUser) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    request.user = toUserDto(dbUser);
  };
}
