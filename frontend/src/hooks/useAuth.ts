import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext, logoutAndClear, mapAuthError } from '@/providers/AuthProvider';
import { usePorts } from '@/providers/PortsProvider';
import type { User } from '@/types/auth';
import { appConfig } from '@/config';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, status, setUser, refreshSession } = useAuthContext();
  // setUser exposed for settings / profile updates
  const ports = usePorts();
  const navigate = useNavigate();

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const u = await ports.auth.login(email, password);
      setUser(u);
      if (appConfig.useMock) useAuthStore.setState({ currentUser: u });
      return u;
    },
    [ports.auth, setUser],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string): Promise<User> => {
      const u = await ports.auth.register(email, password, displayName);
      setUser(u);
      if (appConfig.useMock) useAuthStore.setState({ currentUser: u });
      return u;
    },
    [ports.auth, setUser],
  );

  const logout = useCallback(async () => {
    await logoutAndClear(ports);
    setUser(null);
    navigate('/login', { replace: true });
  }, [ports, setUser, navigate]);

  const loginDemo = useCallback(async (): Promise<User> => {
    const u = await ports.auth.loginDemo();
    setUser(u);
    if (appConfig.useMock) useAuthStore.setState({ currentUser: u });
    return u;
  }, [ports.auth, setUser]);

  const loginWithGoogle = useCallback(async (): Promise<User> => {
    return ports.auth.loginWithGoogle();
  }, [ports.auth]);

  return {
    user,
    status,
    login,
    register,
    logout,
    loginDemo,
    loginWithGoogle,
    refreshSession,
    mapAuthError,
    setUser,
  };
}
