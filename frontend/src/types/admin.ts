export type AdminUserStatus = 'active' | 'disabled';
export type AdminUserRole = 'user' | 'admin';

export interface AdminUserListItem {
  id: string;
  email: string;
  displayName: string;
  authProvider: 'local' | 'google';
  role: AdminUserRole;
  locale: 'it' | 'en';
  status: AdminUserStatus;
  createdAt: string;
  lastSessionAt: string | null;
}

export interface AdminUsersListResponse {
  items: AdminUserListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminMetricsOverview {
  users: {
    total: number;
    newLast7Days: number;
    newLast30Days: number;
    byAuthProvider: { local: number; google: number };
  };
  conversations: {
    total: number;
    active: number;
    messagesLast7Days: number;
    promptReadyRate: number;
  };
  system: { healthOk: boolean; dbOk: boolean; llmEnabled?: boolean };
  llm: {
    callsLast7Days: number;
    inputTokensLast7Days: number;
    outputTokensLast7Days: number;
    estimatedUsdLast7Days: number;
  };
}

export interface AdminUserDetail {
  id: string;
  email: string;
  displayName: string;
  authProvider: 'local' | 'google';
  role: AdminUserRole;
  locale: 'it' | 'en';
  status: AdminUserStatus;
  createdAt: string;
  stats: {
    conversations: number;
    messages: number;
    files: number;
    llmCallsLast30Days: number;
    inputTokensLast30Days: number;
    outputTokensLast30Days: number;
  };
}

export interface AdminPlatformSettings {
  envReadOnly: Record<string, unknown>;
  overrides: Record<string, unknown>;
}

export interface AdminPromptTemplateGroup {
  key: string;
  provider: string;
  active: { id: string; version: number; body: string; updatedAt: string } | null;
  recentVersions: { id: string; version: number; active: boolean; updatedAt: string }[];
}
