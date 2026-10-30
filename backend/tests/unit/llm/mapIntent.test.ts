import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { promptStructureChecks } from '../../../src/services/llm/mapIntent.js';
import { promptArtifactSchema } from '../../../src/services/llm/intentModel.js';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/llm');

describe('T-PROMPT structure (fixtures)', () => {
  it('T-PROMPT-01 prompt contains objective section', () => {
    const artifact = promptArtifactSchema.parse(
      JSON.parse(readFileSync(join(fixtureDir, 'sample-prompt-artifact.json'), 'utf8')),
    );
    const checks = promptStructureChecks(artifact.bodyMarkdown, 'it');
    expect(checks.hasObjective).toBe(true);
  });

  it('T-PROMPT-02 assumptions visible in markdown', () => {
    const artifact = promptArtifactSchema.parse(
      JSON.parse(readFileSync(join(fixtureDir, 'sample-prompt-artifact.json'), 'utf8')),
    );
    const checks = promptStructureChecks(artifact.bodyMarkdown, 'it');
    expect(checks.hasAssumptionsSection).toBe(true);
  });
});
