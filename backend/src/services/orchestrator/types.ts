import type { ConversationUiPhaseDto } from '../../types/conversationDto.js';

export interface ClarificationQuestion {
  id: string;
  text: string;
  reason?: string;
}

export interface Interpretation {
  objective: string;
  context?: string;
  audience?: string;
  assumptions: string[];
}

export interface ConversationAiState {
  phase: ConversationUiPhaseDto;
  interpretation: Interpretation | null;
  pendingQuestions: ClarificationQuestion[];
  clarificationTurns: number;
}

export const defaultAiState = (): ConversationAiState => ({
  phase: 'idle',
  interpretation: null,
  pendingQuestions: [],
  clarificationTurns: 0,
});
