import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decideEngineStep, shouldSkipQuestionsForSimpleIntent } from '../../../src/services/llm/decide.js';
import { intentModelSchema } from '../../../src/services/llm/intentModel.js';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/llm');

function loadIntent(name: string) {
  return intentModelSchema.parse(JSON.parse(readFileSync(join(fixtureDir, name), 'utf8')));
}

describe('T-CONV decide (fixtures)', () => {
  it('T-CONV-01 simple intent → generate without ask at turn 0', () => {
    const intent = loadIntent('ev01-simple-intent.json');
    expect(shouldSkipQuestionsForSimpleIntent(intent)).toBe(true);
    expect(decideEngineStep(intent, 0)).toBe('generate');
  });

  it('T-CONV-02 ambiguous marketing → ask when questions present', () => {
    const intent = loadIntent('ev02-marketing-intent.json');
    expect(decideEngineStep(intent, 0)).toBe('ask');
  });

  it('T-SEC-01 refusal intent → refuse', () => {
    const intent = loadIntent('ev06-refusal-intent.json');
    expect(decideEngineStep(intent, 0)).toBe('refuse');
  });
});
