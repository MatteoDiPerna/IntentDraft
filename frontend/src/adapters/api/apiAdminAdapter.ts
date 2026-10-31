import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import { appConfig } from '@/config';
import type { AdminPort } from '@/adapters/types';
import type {
  AdminMetricsOverview,
  AdminPlatformSettings,
  AdminUserDetail,
  AdminUsersListResponse,
} from '@/types/admin';

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const apiAdminAdapter: AdminPort = {
  async getMetricsOverview(days = 7) {
    return request<AdminMetricsOverview>('GET', `${API.admin.metricsOverview}${qs({ days })}`);
  },
  async listUsers(params) {
    return request<AdminUsersListResponse>(
      'GET',
      `${API.admin.users}${qs({ page: params.page, pageSize: params.pageSize, q: params.q })}`,
    );
  },
  async getUser(id) {
    return request<AdminUserDetail>('GET', API.admin.user(id));
  },
  async patchUser(id, patch) {
    await request('PATCH', API.admin.user(id), { body: patch });
  },
  async forcePasswordReset(id) {
    return request<{ ok: true; devResetUrl?: string }>('POST', API.admin.userForceReset(id));
  },
  async exportUsageCsv(params) {
    const url = `${appConfig.apiUrl.replace(/\/$/, '')}${API.admin.usageExport}${qs({
      from: params.from,
      to: params.to,
      format: 'csv',
    })}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },
  async listPromptTemplates() {
    return request('GET', API.admin.promptTemplates);
  },
  async putPromptTemplate(key, body) {
    await request('PUT', API.admin.promptTemplate(key), { body });
  },
  async dryRunPrompt(input) {
    return request('POST', API.admin.promptDryRun, { body: input });
  },
  async getPlatformSettings() {
    return request<AdminPlatformSettings>('GET', API.admin.platformSettings);
  },
  async putPlatformSettings(overrides) {
    await request('PUT', API.admin.platformSettings, { body: overrides });
  },
  async getLegalContent() {
    return request('GET', API.admin.complianceLegal);
  },
  async putLegalContent(input) {
    await request('PUT', API.admin.complianceLegal, { body: input });
  },
  async recordCookieConsent(choice) {
    await request('POST', API.consent.cookie, { body: { choice } });
  },
  async getCookieConsentSummary() {
    return request('GET', API.admin.complianceCookieConsents);
  },
};
