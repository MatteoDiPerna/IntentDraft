import Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { LlmUnavailableError } from './llmErrors.js';

export type LlmCompletion = {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
};

export type LlmMessageClient = {
  complete(system: string, user: string): Promise<LlmCompletion>;
};

let testClient: LlmMessageClient | null = null;

/** @internal tests */
export function setLlmClientForTests(client: LlmMessageClient | null): void {
  testClient = client;
}

function isRetryableStatus(status: number | undefined): boolean {
  return status === 429 || status === 503 || status === 529;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createAnthropicClient(env: Env): LlmMessageClient {
  if (testClient) return testClient;

  const apiKey = env.ANTHROPIC_API_KEY.trim();
  if (!apiKey) {
    throw new LlmUnavailableError('ANTHROPIC_API_KEY missing');
  }

  const anthropic = new Anthropic({ apiKey });
  const model = env.ANTHROPIC_MODEL;
  const timeoutMs = env.LLM_TIMEOUT_MS;

  return {
    async complete(system: string, user: string): Promise<LlmCompletion> {
      let lastErr: unknown;
      for (let attempt = 0; attempt <= 2; attempt++) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);
          const response = await anthropic.messages.create(
            {
              model,
              max_tokens: env.LLM_MAX_OUTPUT_TOKENS,
              system,
              messages: [{ role: 'user', content: user }],
            },
            { signal: controller.signal },
          );
          clearTimeout(timer);

          const text = response.content
            .filter((b) => b.type === 'text')
            .map((b) => (b.type === 'text' ? b.text : ''))
            .join('\n')
            .trim();

          const usage = response.usage;
          logger.info('LLM completion', {
            model,
            inputTokens: usage.input_tokens,
            outputTokens: usage.output_tokens,
            phase: system.slice(0, 40),
          });

          return {
            text,
            inputTokens: usage.input_tokens,
            outputTokens: usage.output_tokens,
            model,
          };
        } catch (err) {
          lastErr = err;
          const status =
            typeof err === 'object' && err && 'status' in err
              ? Number((err as { status?: number }).status)
              : undefined;
          if (attempt < 2 && isRetryableStatus(status)) {
            await sleep(400 * (attempt + 1));
            continue;
          }
          if (err instanceof Error && err.name === 'AbortError') {
            throw new LlmUnavailableError('LLM timeout');
          }
          throw new LlmUnavailableError('LLM request failed', String(status ?? 'unknown'));
        }
      }
      throw new LlmUnavailableError('LLM request failed after retries', String(lastErr));
    },
  };
}

export function shouldUseLlm(env: Env): boolean {
  return env.LLM_ENABLED && env.ANTHROPIC_API_KEY.trim().length > 0;
}
