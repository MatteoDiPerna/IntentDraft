import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, setUnauthorizedHandler } from '@/api/client';
import { usePorts } from '@/providers/PortsProvider';
import { useAuthStore } from '@/store/authStore';
import { useConversationStore } from '@/store/conversationStore';
import type { User } from '@/types/auth';
import { appConfig } from '@/config';
import { hydrateConversationsFromApi } from '@/adapters/api/apiConversationAdapter';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const ports = usePorts();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refreshSession = useCallback(async () => {
    setStatus('loading');
    try {
      const sessionUser = await ports.auth.getSession();
      if (sessionUser && !appConfig.useMock) {
        await hydrateConversationsFromApi(sessionUser.id);
      }
      setUser(sessionUser);
      if (appConfig.useMock && sessionUser) {
        useAuthStore.setState({ currentUser: sessionUser });
      }
      setStatus(sessionUser ? 'authenticated' : 'anonymous');
    } catch {
      setUser(null);
      setStatus('anonymous');
    }
  }, [ports.auth]);

  useEffect(() => {
    const run = () => void refreshSession();
    if (appConfig.useMock) {
      type PersistedAuthStore = typeof useAuthStore & {
        persist: {
          hasHydrated: () => boolean;
          onFinishHydration: (fn: () => void) => () => void;
        };
      };
      const store = useAuthStore as PersistedAuthStore;
      if (store.persist.hasHydrated()) run();
      else return store.persist.onFinishHydration(run);
    }
    run();
  }, [refreshSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      useAuthStore.getState().logout();
      setStatus('anonymous');
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  const setUserAndStatus = useCallback((next: User | null) => {
    setUser(next);
    setStatus(next ? 'authenticated' : 'anonymous');
  }, []);

  const value = useMemo(
    () => ({ user, status, refreshSession, setUser: setUserAndStatus }),
    [user, status, refreshSession, setUserAndStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export function mapAuthError(err: unknown): string {
  if (err instanceof ApiError) return err.code;
  if (err instanceof Error) return err.message;
  return 'INTERNAL_ERROR';
}

export async function logoutAndClear(ports: ReturnType<typeof usePorts>): Promise<void> {
  try {
    await ports.auth.logout();
  } catch {
    /* ignore */
  }
  useAuthStore.getState().logout();
  useConversationStore.setState({ byUser: {}, activeId: {} });
}
