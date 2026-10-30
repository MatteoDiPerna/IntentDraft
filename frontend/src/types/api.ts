import type { User } from '@/types/auth';
import type { PromptArtifact } from '@/types/prompt';
import type {
  ChatMessage,
  ClarificationQuestion,
  ConversationUiPhase,
  Interpretation,
} from '@/types/conversation';

export interface ConversationMetadata {
  pinned?: boolean;
  inProject?: boolean;
  projectId?: string | null;
}

export interface ConversationSummaryDto {
  id: string;
  title: string;
  status: 'active' | 'archived';
  metadata: ConversationMetadata;
  updatedAt: string;
  createdAt: string;
  lastMessagePreview?: string;
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

export interface ConversationDetailDto extends ConversationSummaryDto {
  messages: ChatMessage[];
  latestPrompt?: PromptArtifact | null;
  files: UploadedFileDto[];
  phase?: ConversationUiPhase;
  interpretation?: Interpretation | null;
  pendingQuestions?: ClarificationQuestion[];
  clarificationTurns?: number;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage?: ChatMessage;
  conversationPhase?: ConversationUiPhase;
  prompt?: PromptArtifact;
}

export interface AuthResponse {
  user: User;
}
