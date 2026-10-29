import type { AuthPort } from '@/adapters/types';
import { useAuthStore } from '@/store/authStore';
import { createId } from '@/lib/ids';

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
};
