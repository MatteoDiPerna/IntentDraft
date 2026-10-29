import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError, errorPayload } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.status(error.status).send(errorPayload(error));
  }

  if (error.validation) {
    return reply.status(400).send(
      errorPayload(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', { issues: error.validation })),
    );
  }

  logger.error('Unhandled error', { name: error.name, message: error.message });
  return reply.status(500).send(errorPayload(new AppError(500, 'INTERNAL_ERROR', 'Internal server error')));
}
