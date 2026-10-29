import type { User } from '../modules/auth/userDto.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}
