import type { User } from '@/types/auth';
import type { PromptArtifact } from '@/types/prompt';
import type { ChatMessage, ConversationUiPhase } from '@/types/conversation';

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
