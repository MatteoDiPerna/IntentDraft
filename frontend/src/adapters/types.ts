import type { Locale, User } from '@/types/auth';
import type {
  AdminMetricsOverview,
  AdminPlatformSettings,
  AdminPromptTemplateGroup,
  AdminUserDetail,
  AdminUsersListResponse,
} from '@/types/admin';
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
  requestPasswordReset(email: string): Promise<{ devResetUrl?: string }>;
  resetPassword(token: string, password: string): Promise<void>;
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
  moveToProject(userId: string, conversationId: string, projectId: string | null): Promise<void>;
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

export interface AdminPort {
  getMetricsOverview(days?: number): Promise<AdminMetricsOverview>;
  listUsers(params: { page?: number; pageSize?: number; q?: string }): Promise<AdminUsersListResponse>;
  getUser(id: string): Promise<AdminUserDetail>;
  patchUser(id: string, patch: { role?: 'user' | 'admin'; status?: 'active' | 'disabled' }): Promise<void>;
  forcePasswordReset(id: string): Promise<{ devResetUrl?: string }>;
  exportUsageCsv(params: { from?: string; to?: string }): Promise<Blob>;
  listPromptTemplates(): Promise<{ groups: AdminPromptTemplateGroup[] }>;
  putPromptTemplate(
    key: string,
    body: { provider?: string; body: string; activate?: boolean },
  ): Promise<void>;
  dryRunPrompt(input: {
    userText: string;
    locale: 'it' | 'en';
  }): Promise<{ promptMarkdown: string; intentModel?: unknown }>;
  getCookieConsentSummary(): Promise<{
    totals: { accepted: number; rejected: number };
    recent: { id: string; choice: string; userEmail: string | null; createdAt: string }[];
  }>;
  getPlatformSettings(): Promise<AdminPlatformSettings>;
  putPlatformSettings(overrides: Record<string, unknown>): Promise<void>;
  getLegalContent(): Promise<{ pages: { page: string; locale: string; markdown: string }[] }>;
  putLegalContent(input: {
    page: 'limits' | 'privacy' | 'terms';
    locale: 'it' | 'en';
    markdown: string;
  }): Promise<void>;
  recordCookieConsent(choice: 'accepted' | 'rejected'): Promise<void>;
}

export interface AppPorts {
  auth: AuthPort;
  user: UserPort;
  conversations: ConversationPort;
  messages: MessagePort;
  files: FilePort;
  prompts: PromptPort;
  admin: AdminPort;
}
