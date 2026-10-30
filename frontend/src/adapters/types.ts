import type { Locale, User } from '@/types/auth';
import type { Conversation } from '@/types/conversation';
import type { PromptArtifact } from '@/types/prompt';
import type { ConversationMetadata } from '@/types/api';

export interface AuthPort {
  register(email: string, password: string, displayName: string): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getSession(): Promise<User | null>;
  loginDemo(): Promise<User>;
  loginWithGoogle(): Promise<User>;
}

export interface UserPort {
  updateProfile(input: { displayName?: string; locale?: Locale }): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
}

export interface ConversationPort {
  list(userId: string): Conversation[];
  create(userId: string): Promise<string>;
  setActive(userId: string, conversationId: string): void;
  getActive(userId: string): Conversation | null;
  rename(userId: string, conversationId: string, title: string): Promise<void>;
  delete(userId: string, conversationId: string): Promise<void>;
  updateMetadata(
    userId: string,
    conversationId: string,
    metadata: Partial<ConversationMetadata>,
  ): Promise<void>;
  togglePin(userId: string, conversationId: string): Promise<void>;
  toggleInProject(userId: string, conversationId: string): Promise<void>;
}

export interface MessagePort {
  send(
    userId: string,
    conversationId: string,
    text: string,
    locale: Locale,
    attachmentFiles?: File[],
  ): Promise<'size' | 'type' | 'missing' | null>;
  editUserMessage(
    userId: string,
    conversationId: string,
    messageId: string,
    text: string,
    locale: Locale,
  ): Promise<void>;
  skipClarification(userId: string, conversationId: string, locale: Locale): Promise<void>;
  regeneratePrompt(userId: string, conversationId: string, locale: Locale): Promise<void>;
}

export interface FilePort {
  addFiles(
    userId: string,
    conversationId: string,
    messageId: string,
    files: File[],
    onProgress?: (pct: number) => void,
  ): Promise<'size' | 'type' | 'missing' | null>;
  removeFile(userId: string, conversationId: string, fileId: string): Promise<void>;
}

export interface PromptPort {
  getLatest(userId: string, conversationId: string): Promise<PromptArtifact | null>;
  saveBody(userId: string, conversationId: string, bodyMarkdown: string): Promise<void>;
  submitFeedback(
    userId: string,
    conversationId: string,
    useful: boolean,
  ): Promise<void>;
}

export interface AppPorts {
  auth: AuthPort;
  user: UserPort;
  conversations: ConversationPort;
  messages: MessagePort;
  files: FilePort;
  prompts: PromptPort;
}
