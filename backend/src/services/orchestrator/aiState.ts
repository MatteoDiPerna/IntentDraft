import type { Prisma } from '@prisma/client';
import {
  defaultAiState,
  type ConversationAiState,
  type Interpretation,
} from './types.js';

export function parseAiState(raw: unknown): ConversationAiState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return defaultAiState();
  const o = raw as Record<string, unknown>;
  const base = defaultAiState();
  const phase = o.phase;
  if (typeof phase === 'string') {
    base.phase = phase as ConversationAiState['phase'];
  }
  if (o.interpretation && typeof o.interpretation === 'object') {
    base.interpretation = o.interpretation as Interpretation;
  }
  if (Array.isArray(o.pendingQuestions)) {
    base.pendingQuestions = o.pendingQuestions as ConversationAiState['pendingQuestions'];
  }
  if (typeof o.clarificationTurns === 'number') {
    base.clarificationTurns = o.clarificationTurns;
  }
  return base;
}

export function serializeAiState(state: ConversationAiState): Prisma.InputJsonValue {
  return state as unknown as Prisma.InputJsonValue;
}
