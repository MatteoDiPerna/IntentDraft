import type { IntentModel } from './intentModel.js';

const MAX_CLARIFICATION_TURNS = 3;

export type EngineDecision = 'refuse' | 'ask' | 'generate';

export function decideEngineStep(intent: IntentModel, clarificationTurns: number): EngineDecision {
  if (intent.safety.outOfScope) return 'refuse';

  const criticalOpen = intent.clarificationPlan.questions.some((q) => q.impact === 'critical');
  const shouldAsk =
    intent.clarificationPlan.shouldAsk &&
    intent.clarificationPlan.questions.length > 0 &&
    clarificationTurns < MAX_CLARIFICATION_TURNS;

  if (shouldAsk && criticalOpen) return 'ask';
  if (shouldAsk && clarificationTurns < 2) return 'ask';

  return 'generate';
}

/** T-CONV-01: low complexity + no critical gaps → generate (no mandatory questions). */
export function shouldSkipQuestionsForSimpleIntent(intent: IntentModel): boolean {
  return intent.complexity === 'low' && !intent.safety.outOfScope;
}
