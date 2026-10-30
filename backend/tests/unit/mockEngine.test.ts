import { describe, expect, it } from 'vitest';
import { detectUnsupported, runMessagePipeline } from '../../src/services/orchestrator/mockEngine.js';

describe('mockEngine', () => {
  it('detects medical/legal refusal', () => {
    expect(detectUnsupported('consiglio legal')).toBe(true);
    const result = runMessagePipeline({
      locale: 'it',
      userContents: ['consiglio legal'],
      aiState: { clarificationTurns: 0, pendingQuestions: [], interpretation: null },
      hasPrompt: false,
      triggerText: 'consiglio legal',
    });
    expect(result.kind).toBe('refusal');
  });

  it('builds prompt for meeting notes', () => {
    const result = runMessagePipeline({
      locale: 'it',
      userContents: ['organizza appunti riunione'],
      aiState: { clarificationTurns: 0, pendingQuestions: [], interpretation: null },
      hasPrompt: false,
      triggerText: 'organizza appunti riunione',
    });
    expect(result.kind).toBe('prompt_ready');
    if (result.kind === 'prompt_ready') {
      expect(result.promptMarkdown).toContain('Obiettivo');
    }
  });
});
