import type { Locale } from '../../modules/auth/userDto.js';
import type { ClarificationQuestion, Interpretation } from '../orchestrator/types.js';
import type { IntentModel, PromptArtifactModel } from './intentModel.js';

export function mapClarificationQuestions(intent: IntentModel): ClarificationQuestion[] {
  return intent.clarificationPlan.questions.slice(0, 3).map((q) => ({
    id: q.id,
    text: q.userFacingText,
    reason: q.resolvesGap,
  }));
}

export function intentToInterpretation(intent: IntentModel): Interpretation {
  return {
    objective: intent.objective,
    context: intent.context ?? intent.taskSummary,
    audience: intent.audience,
    assumptions: intent.assumptions.map((a) => a.text).filter(Boolean),
  };
}

export function refusalMessage(intent: IntentModel, locale: Locale): string {
  if (intent.safety.refusalReason?.trim()) return intent.safety.refusalReason.trim();
  return locale === 'it'
    ? 'Non posso aiutare con consigli medici o legali. Prova con attività di lavoro o comunicazione.'
    : "I can't help with medical or legal advice. Try work or communication tasks.";
}

export function assistantReplyForQuestions(
  questions: ClarificationQuestion[],
  locale: Locale,
): string {
  const header =
    locale === 'it'
      ? 'Per preparare istruzioni più utili, rispondi (puoi anche usare "Salta"):'
      : 'To prepare better instructions, please answer (or use Skip):';
  return `${header}\n\n${questions.map((q, i) => `${i + 1}. ${q.text}`).join('\n')}`;
}

/** T-PROMPT-01 / T-PROMPT-02 structural checks on generated markdown. */
export function promptStructureChecks(bodyMarkdown: string, locale: Locale): {
  hasObjective: boolean;
  hasAssumptionsSection: boolean;
  numberedSteps: number;
} {
  const objectiveLabel = locale === 'it' ? 'obiettivo' : 'objective';
  const assumptionsLabel = locale === 'it' ? 'assunzioni' : 'assumptions';
  const lower = bodyMarkdown.toLowerCase();
  const numberedSteps = (bodyMarkdown.match(/^\s*\d+\.\s+/gm) ?? []).length;
  return {
    hasObjective: lower.includes(objectiveLabel) || lower.includes('##'),
    hasAssumptionsSection: lower.includes(assumptionsLabel),
    numberedSteps,
  };
}

export function artifactSections(artifact: PromptArtifactModel): { heading: string; content: string }[] {
  return artifact.sections ?? [];
}
