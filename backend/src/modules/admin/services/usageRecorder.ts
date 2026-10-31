import type { Env } from '../../../config/env.js';
import { prisma } from '../../../lib/db.js';
import { Decimal } from '@prisma/client/runtime/library';

export type UsageRecordInput = {
  userId: string;
  conversationId?: string | null;
  phase: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs?: number | null;
};

function estimateUsd(
  env: Env,
  inputTokens: number,
  outputTokens: number,
): Decimal | null {
  const inRate = env.LLM_USD_PER_1M_INPUT;
  const outRate = env.LLM_USD_PER_1M_OUTPUT;
  if (inRate === 0 && outRate === 0) return null;
  const usd =
    (inputTokens / 1_000_000) * inRate + (outputTokens / 1_000_000) * outRate;
  return new Decimal(usd.toFixed(6));
}

export async function recordLlmUsage(env: Env, input: UsageRecordInput): Promise<void> {
  await prisma.llmUsageEvent.create({
    data: {
      userId: input.userId,
      conversationId: input.conversationId ?? null,
      phase: input.phase,
      provider: input.provider,
      model: input.model,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      usdEstimate: estimateUsd(env, input.inputTokens, input.outputTokens),
      latencyMs: input.latencyMs ?? null,
    },
  });
}
