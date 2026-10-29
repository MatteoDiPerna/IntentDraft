import type { UserPort } from '@/adapters/types';
import { useAuthStore } from '@/store/authStore';
export const mockUserAdapter: UserPort = {
  async updateProfile(input) {
    const state = useAuthStore.getState();
    const current = state.currentUser;
    if (!current) throw new Error('UNAUTHORIZED');
    const displayName =
      input.displayName !== undefined ? input.displayName.trim() : current.displayName;
    const locale = input.locale ?? current.locale;
    if (input.locale) state.setLocale(input.locale);
    const users = state.users.map((u) =>
      u.id === current.id ? { ...u, displayName, locale } : u,
    );
    useAuthStore.setState({
      users,
      currentUser: { ...current, displayName, locale },
    });
    return useAuthStore.getState().currentUser!;
  },
  async changePassword(currentPassword, newPassword) {
    const state = useAuthStore.getState();
    const current = state.currentUser;
    if (!current?.hasPassword) throw new Error('NO_PASSWORD');
    const stored = state.users.find((u) => u.id === current.id);
    if (!stored || stored.passwordHash !== currentPassword) {
      throw new Error('INVALID_PASSWORD');
    }
    useAuthStore.setState({
      users: state.users.map((u) =>
        u.id === current.id ? { ...u, passwordHash: newPassword } : u,
      ),
    });
  },
};
