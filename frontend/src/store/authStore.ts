import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale, StoredUser, User } from '@/types/auth';
import { createId } from '@/lib/ids';
import { STORAGE } from '@/lib/storageKeys';
import i18n from '@/i18n';
import { appConfig } from '@/config';

interface AuthState {
  users: StoredUser[];
  currentUser: User | null;
  register: (email: string, password: string, displayName: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setLocale: (locale: Locale) => void;
  updateDisplayName: (displayName: string) => void;
  loginDemo: () => void;
}

const DEMO_EMAIL = 'demo@intentdraft.local';
const DEMO_PASSWORD = 'demo1234';

function toUser(stored: StoredUser): User {
  return {
    id: stored.id,
    email: stored.email,
    displayName: stored.displayName,
    locale: stored.locale,
    authProvider: stored.authProvider ?? 'local',
    hasPassword: stored.hasPassword ?? true,
    role: stored.role ?? 'user',
  };
}

const authImpl: StateCreator<AuthState> = (set, get) => ({
  users: [],
  currentUser: null,
  register: (email, password, displayName) => {
    const normalized = email.trim().toLowerCase();
    if (get().users.some((u) => u.email === normalized)) return false;
    const user: StoredUser = {
      id: createId(),
      email: normalized,
      displayName: displayName.trim() || normalized.split('@')[0],
      passwordHash: password,
      locale: 'it',
      authProvider: 'local',
      hasPassword: true,
      role: 'user',
    };
    set({ users: [...get().users, user], currentUser: toUser(user) });
    return true;
  },
  login: (email, password) => {
    const normalized = email.trim().toLowerCase();
    const found = get().users.find(
      (u) => u.email === normalized && u.passwordHash === password,
    );
    if (!found) return false;
    set({ currentUser: toUser(found) });
    return true;
  },
  logout: () => set({ currentUser: null }),
  loginDemo: () => {
    if (!get().login(DEMO_EMAIL, DEMO_PASSWORD)) {
      get().register(DEMO_EMAIL, DEMO_PASSWORD, 'Demo');
    }
  },
  setLocale: (locale) => {
    const current = get().currentUser;
    if (!current) return;
    const users = get().users.map((u) => (u.id === current.id ? { ...u, locale } : u));
    set({
      users,
      currentUser: { ...current, locale },
    });
    localStorage.setItem(STORAGE.locale, locale);
    void i18n.changeLanguage(locale);
  },
  updateDisplayName: (displayName) => {
    const current = get().currentUser;
    if (!current) return;
    const trimmed = displayName.trim();
    const users = get().users.map((u) =>
      u.id === current.id ? { ...u, displayName: trimmed } : u,
    );
    set({ users, currentUser: { ...current, displayName: trimmed } });
  },
});

export const useAuthStore = appConfig.useMock
  ? create<AuthState>()(persist(authImpl, { name: STORAGE.auth }))
  : create<AuthState>()(authImpl);
