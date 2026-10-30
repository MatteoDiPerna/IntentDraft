/** Mirror of frontend/src/types/api.ts + conversation.ts (API contract §8.3). */

export type ConversationStatusDto = 'active' | 'archived';

export interface ConversationMetadataDto {
  pinned?: boolean;
  inProject?: boolean;
  projectId?: string | null;
}

export interface ConversationSummaryDto {
  id: string;
  title: string;
  status: ConversationStatusDto;
  metadata: ConversationMetadataDto;
  updatedAt: string;
  createdAt: string;
  lastMessagePreview?: string;
}

export type MessageRoleDto = 'user' | 'assistant' | 'system';

export interface ChatMessageDto {
  id: string;
  role: MessageRoleDto;
  content: string;
  createdAt: string;
}

export type ConversationUiPhaseDto =
  | 'idle'
  | 'analyzing'
  | 'clarifying'
  | 'generating'
  | 'prompt_ready'
  | 'error_recoverable';

export interface PromptArtifactDto {
  version: '1';
  id?: string;
  title: string;
  bodyMarkdown: string;
  sections: { heading: string; content: string }[];
  decompositionIncluded: boolean;
  warnings?: string[];
}

export interface UploadedFileDto {
  id: string;
  conversationId: string;
  messageId?: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  scanStatus: 'pending' | 'ok' | 'rejected';
  createdAt: string;
}

export interface InterpretationDto {
  objective: string;
  context?: string;
  audience?: string;
  assumptions: string[];
}

export interface ClarificationQuestionDto {
  id: string;
  text: string;
  reason?: string;
}

export interface ConversationDetailDto extends ConversationSummaryDto {
  messages: ChatMessageDto[];
  latestPrompt?: PromptArtifactDto | null;
  files: UploadedFileDto[];
  phase?: ConversationUiPhaseDto;
  interpretation?: InterpretationDto | null;
  pendingQuestions?: ClarificationQuestionDto[];
  clarificationTurns?: number;
}
