import { AppError } from '../../lib/errors.js';

export class LlmUnavailableError extends Error {
  constructor(
    message: string,
    readonly causeCode?: string,
  ) {
    super(message);
    this.name = 'LlmUnavailableError';
  }
}

export function toLlmAppError(err: unknown): AppError {
  if (err instanceof LlmUnavailableError) {
    return new AppError(503, 'LLM_UNAVAILABLE', err.message);
  }
  return new AppError(503, 'LLM_UNAVAILABLE', 'AI service temporarily unavailable');
}
