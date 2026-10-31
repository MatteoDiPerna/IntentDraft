import type { Env } from '../../config/env.js';
import type { Locale } from '../../modules/auth/userDto.js';
import { shouldUseLlm } from '../llm/anthropicClient.js';
import {
  llmRunMessagePipeline,
  llmRunRegeneratePipeline,
  llmRunSkipPipeline,
} from '../llm/llmEngine.js';
import type { Interpretation } from './types.js';
import {
  runMessagePipeline,
  runRegeneratePipeline,
  runSkipPipeline,
  type PipelineInput,
  type PipelineResult,
} from './mockEngine.js';

export async function runMessagePipelineAsync(input: PipelineInput, env: Env): Promise<PipelineResult> {
  if (shouldUseLlm(env)) {
    return llmRunMessagePipeline(input, env);
  }
  return runMessagePipeline(input);
}

export async function runSkipPipelineAsync(
  env: Env,
  locale: Locale,
  userContents: string[],
  clarificationTurns: number,
  usage?: { userId: string; conversationId?: string | null },
): Promise<PipelineResult> {
  if (shouldUseLlm(env)) {
    return llmRunSkipPipeline(env, locale, userContents, clarificationTurns, usage);
  }
  return runSkipPipeline(locale, userContents, clarificationTurns);
}

export async function runRegeneratePipelineAsync(
  env: Env,
  locale: Locale,
  userContents: string[],
  interpretation: Interpretation,
  usage?: { userId: string; conversationId?: string | null },
): Promise<{ promptMarkdown: string; promptSections?: { heading: string; content: string }[] }> {
  if (shouldUseLlm(env)) {
    const out = await llmRunRegeneratePipeline(env, locale, userContents, interpretation, usage);
    return { promptMarkdown: out.promptMarkdown, promptSections: out.sections };
  }
  const { promptMarkdown } = runRegeneratePipeline(locale, interpretation);
  return { promptMarkdown };
}
