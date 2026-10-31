import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { AuthPort } from '@/adapters/types';
import type { AuthResponse } from '@/types/api';
import { appConfig } from '@/config';

export const apiAuthAdapter: AuthPort = {
  async register(email, password, displayName) {
    const data = await request<AuthResponse>('POST', API.auth.register, {
      body: { email, password, displayName },
    });
    return data.user;
  },
  async login(email, password) {
    const data = await request<AuthResponse>('POST', API.auth.login, {
      body: { email, password },
    });
    return data.user;
  },
  async logout() {
    await request('POST', API.auth.logout);
  },
  async getSession() {
    try {
      const data = await request<AuthResponse>('GET', API.auth.me);
      return data.user;
    } catch {
      return null;
    }
  },
  async loginDemo() {
    throw new Error('DEMO_DISABLED');
  },
  async loginWithGoogle() {
    window.location.href = appConfig.googleAuthStartUrl;
    return new Promise(() => {});
  },
  async requestPasswordReset(email) {
    return request<{ ok: true; devResetUrl?: string }>('POST', API.auth.forgotPassword, {
      body: { email },
    });
  },
  async resetPassword(token, password) {
    await request('POST', API.auth.resetPassword, { body: { token, password } });
  },
};
