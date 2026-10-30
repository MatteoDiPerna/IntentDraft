import type { Locale } from '../../modules/auth/userDto.js';

export function analyzeSystemPrompt(locale: Locale): string {
  const lang = locale === 'it' ? 'Italian' : 'English';
  return `You are a requirements analyst for non-technical users preparing instructions for an external LLM.
Respond with ONLY valid JSON matching this schema (no markdown outside JSON):
{
  "objective": string (required, non-empty),
  "taskSummary": string,
  "audience": string,
  "context": string,
  "complexity": "low"|"medium"|"high",
  "assumptions": [{"field": string, "text": string, "reason": string}],
  "clarificationPlan": {
    "shouldAsk": boolean,
    "questions": [{"id": string, "userFacingText": string, "resolvesGap": string, "impact": "critical"|"moderate", "optionalSkip": boolean}],
    "maxTurnsRemaining": number
  },
  "safety": {"outOfScope": boolean, "refusalReason": string},
  "decomposition": [{"order": number, "title": string, "instruction": string}]
}
Rules:
- User language for questions: ${lang}.
- Do not invent facts; only use what the user provided.
- Set safety.outOfScope for personalized medical/legal/financial advice.
- For simple, clear requests (complexity low, no critical gaps): shouldAsk false, questions [].
- At most 3 questions when shouldAsk is true.
- assumptions may be empty.`;
}

export function generateSystemPrompt(locale: Locale): string {
  const lang = locale === 'it' ? 'Italian' : 'English';
  return `You compose self-contained instructions for a general-purpose LLM (copy/paste ready).
Respond with ONLY valid JSON:
{
  "title": string,
  "bodyMarkdown": string (full prompt in ${lang}, markdown headings),
  "sections": [{"heading": string, "content": string}],
  "warnings": [string]
}
Rules:
- Include explicit objective, context, constraints, output format, quality checks.
- Include "## Assunzioni" / "## Assumptions" section when assumptions are non-empty.
- For high complexity or decomposition steps, include numbered steps (at least 4 when task spans Excel+presentation style work).
- Never invent attachments or data the user did not provide.
- Do not execute code; output text only.`;
}

export function formatUserTranscript(userContents: string[]): string {
  if (userContents.length === 0) return '(empty)';
  return userContents
    .map((text, i) => `--- User message ${i + 1} ---\n${text.trim()}`)
    .join('\n\n');
}
