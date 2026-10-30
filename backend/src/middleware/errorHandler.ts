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

  if (error.statusCode === 429 || error.code === 'FST_ERR_RATE_LIMIT') {
    return reply.status(429).send(
      errorPayload(new AppError(429, 'RATE_LIMITED', 'Too many requests. Please try again later.')),
    );
  }

  if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
    return reply
      .status(400)
      .send(errorPayload(new AppError(400, 'VALIDATION_ERROR', 'File too large')));
  }

  logger.error('Unhandled error', { name: error.name, message: error.message });
  return reply.status(500).send(errorPayload(new AppError(500, 'INTERNAL_ERROR', 'Internal server error')));
}
