import type { Env } from '../../../config/env.js';
import type { Locale } from '../../auth/userDto.js';
import { llmDryRunPipeline } from '../../../services/llm/llmEngine.js';

export async function adminDryRun(env: Env, userText: string, locale: Locale) {
  return llmDryRunPipeline(env, locale, userText.trim());
}
