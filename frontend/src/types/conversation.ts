export type MessageRole = 'user' | 'assistant' | 'system';

export type ConversationUiPhase =
  | 'idle'
  | 'analyzing'
  | 'clarifying'
  | 'generating'
  | 'prompt_ready'
  | 'error_recoverable';

export interface Interpretation {
  objective: string;
  context?: string;
  audience?: string;
  assumptions: string[];
}

export interface ClarificationQuestion {
  id: string;
  text: string;
  reason?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface AttachedFile {
  id: string;
  messageId: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  phase: ConversationUiPhase;
  interpretation: Interpretation | null;
  pendingQuestions: ClarificationQuestion[];
  clarificationTurns: number;
  promptText: string;
  files: AttachedFile[];
  updatedAt: string;
  /** ChatGPT-style pinned chats */
  pinned: boolean;
  /** Chats grouped under the default project folder (mock) */
  inProject: boolean;
}
