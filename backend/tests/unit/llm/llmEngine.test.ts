import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { loadEnv, resetEnvCache } from '../../../src/config/env.js';
import { setLlmClientForTests, type LlmMessageClient } from '../../../src/services/llm/anthropicClient.js';
import { llmRunMessagePipeline } from '../../../src/services/llm/llmEngine.js';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/llm');

function fixture(name: string): string {
  return readFileSync(join(fixtureDir, name), 'utf8');
}

describe('llmEngine (mocked client)', () => {
  afterEach(() => {
    setLlmClientForTests(null);
    resetEnvCache();
  });

  function llmTestEnv() {
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/intentdraft_test';
    process.env.LLM_ENABLED = 'true';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    resetEnvCache();
    return loadEnv();
  }

  it('returns clarifying when analyze suggests questions', async () => {
    const env = llmTestEnv();
    let call = 0;
    const client: LlmMessageClient = {
      async complete() {
        call += 1;
        if (call === 1) return { text: fixture('ev02-marketing-intent.json'), inputTokens: 1, outputTokens: 1, model: 'test' };
        return { text: fixture('sample-prompt-artifact.json'), inputTokens: 1, outputTokens: 1, model: 'test' };
      },
    };
    setLlmClientForTests(client);

    const result = await llmRunMessagePipeline(
      {
        locale: 'it',
        userContents: ['piano marketing'],
        aiState: { clarificationTurns: 0, pendingQuestions: [], interpretation: null },
        hasPrompt: false,
        triggerText: 'piano marketing',
      },
      env,
    );

    expect(result.kind).toBe('clarifying');
  });

  it('returns prompt_ready when analyze is simple', async () => {
    const env = llmTestEnv();

    let call = 0;
    const client: LlmMessageClient = {
      async complete() {
        call += 1;
        if (call === 1) return { text: fixture('ev01-simple-intent.json'), inputTokens: 10, outputTokens: 20, model: 'test' };
        return { text: fixture('sample-prompt-artifact.json'), inputTokens: 10, outputTokens: 30, model: 'test' };
      },
    };
    setLlmClientForTests(client);

    const result = await llmRunMessagePipeline(
      {
        locale: 'en',
        userContents: ['organize meeting notes'],
        aiState: { clarificationTurns: 0, pendingQuestions: [], interpretation: null },
        hasPrompt: false,
        triggerText: 'organize meeting notes',
      },
      env,
    );

    expect(result.kind).toBe('prompt_ready');
    if (result.kind === 'prompt_ready') {
      expect(result.promptMarkdown).toContain('Obiettivo');
    }
  });
});
