import type { AdminPort } from '@/adapters/types';
import type { AdminMetricsOverview, AdminUserDetail } from '@/types/admin';

const demoMetrics: AdminMetricsOverview = {
  users: { total: 12, newLast7Days: 2, newLast30Days: 5, byAuthProvider: { local: 10, google: 2 } },
  conversations: { total: 48, active: 40, messagesLast7Days: 120, promptReadyRate: 0.55 },
  system: { healthOk: true, dbOk: true, llmEnabled: false },
  llm: { callsLast7Days: 0, inputTokensLast7Days: 0, outputTokensLast7Days: 0, estimatedUsdLast7Days: 0 },
};

export const mockAdminAdapter: AdminPort = {
  async getMetricsOverview() {
    return demoMetrics;
  },
  async listUsers({ page = 1, pageSize = 20 }) {
    const items = [
      {
        id: 'mock-admin',
        email: 'admin@intentdraft.local',
        displayName: 'Admin',
        authProvider: 'local' as const,
        role: 'admin' as const,
        locale: 'it' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        lastSessionAt: new Date().toISOString(),
      },
    ];
    return { items, page, pageSize, total: items.length };
  },
  async getUser(id) {
    const detail: AdminUserDetail = {
      id,
      email: 'user@intentdraft.local',
      displayName: 'User',
      authProvider: 'local',
      role: 'user',
      locale: 'it',
      status: 'active',
      createdAt: new Date().toISOString(),
      stats: {
        conversations: 3,
        messages: 12,
        files: 0,
        llmCallsLast30Days: 0,
        inputTokensLast30Days: 0,
        outputTokensLast30Days: 0,
      },
    };
    return detail;
  },
  async patchUser() {},
  async forcePasswordReset() {
    return {};
  },
  async exportUsageCsv() {
    return new Blob(['date,user_email,phase,model,input_tokens,output_tokens,usd_estimate\n'], {
      type: 'text/csv',
    });
  },
  async listPromptTemplates() {
    return { groups: [] };
  },
  async putPromptTemplate() {},
  async dryRunPrompt({ userText }) {
    return {
      promptMarkdown: `# Mock prompt\n\n${userText}`,
      intentModel: { objective: userText, complexity: 'low' },
    };
  },
  async getCookieConsentSummary() {
    return {
      totals: { accepted: 1, rejected: 0 },
      recent: [
        {
          id: 'mock-cookie',
          choice: 'accepted',
          userEmail: null,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  },
  async getPlatformSettings() {
    return {
      envReadOnly: { maxUploadBytes: 5_000_000, llmEnabled: false },
      overrides: {},
    };
  },
  async putPlatformSettings() {},
  async getLegalContent() {
    return { pages: [] };
  },
  async putLegalContent() {},
  async recordCookieConsent() {},
};
