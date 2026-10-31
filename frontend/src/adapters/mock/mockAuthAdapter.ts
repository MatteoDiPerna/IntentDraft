import { ApiError } from '@/api/client';
import type { AuthPort } from '@/adapters/types';
import { useAuthStore } from '@/store/authStore';
import { createId } from '@/lib/ids';
import { createMockResetToken, parseMockResetToken } from '@/lib/mockPasswordReset';

function getState() {
  return useAuthStore.getState();
}

export const mockAuthAdapter: AuthPort = {
  async register(email, password, displayName) {
    const ok = getState().register(email, password, displayName);
    if (!ok) throw new Error('EMAIL_TAKEN');
    const user = getState().currentUser;
    if (!user) throw new Error('REGISTER_FAILED');
    return user;
  },
  async login(email, password) {
    const ok = getState().login(email, password);
    if (!ok) throw new Error('INVALID_CREDENTIALS');
    const user = getState().currentUser!;
    return user;
  },
  async logout() {
    getState().logout();
  },
  async getSession() {
    return getState().currentUser;
  },
  async loginDemo() {
    getState().loginDemo();
    const user = getState().currentUser;
    if (!user) throw new Error('DEMO_FAILED');
    return user;
  },
  async loginWithGoogle() {
    const email = `google-${createId().slice(0, 8)}@intentdraft.local`;
    getState().register(email, createId(), 'Google User');
    const u = getState().currentUser!;
    useAuthStore.setState({
      currentUser: { ...u, authProvider: 'google', hasPassword: false },
      users: getState().users.map((x) =>
        x.id === u.id ? { ...x, authProvider: 'google', hasPassword: false } : x,
      ),
    });
    return getState().currentUser!;
  },
  async requestPasswordReset(email) {
    const normalized = email.trim().toLowerCase();
    const user = getState().users.find((u) => u.email === normalized);
    if (!user) {
      throw new ApiError(
        404,
        'EMAIL_NOT_REGISTERED',
        'No account is registered with this email address',
      );
    }
    if (user.hasPassword === false || user.authProvider === 'google') {
      throw new ApiError(
        400,
        'PASSWORD_RESET_UNAVAILABLE',
        'This account uses Google sign-in and has no password to reset',
      );
    }
    const token = createMockResetToken(normalized);
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return { ok: true as const, devResetUrl: `${base}/reset-password?token=${encodeURIComponent(token)}` };
  },
  async resetPassword(token, password) {
    const email = parseMockResetToken(token);
    if (!email) throw new Error('INVALID_TOKEN');
    const users = getState().users.map((u) =>
      u.email === email ? { ...u, passwordHash: password } : u,
    );
    useAuthStore.setState({ users });
  },
};
