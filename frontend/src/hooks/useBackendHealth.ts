import { useCallback, useEffect, useState } from 'react';
import { checkHealth } from '@/api/client';
import { appConfig } from '@/config';

export function useBackendHealth(pollMs = 30_000) {
  const [healthy, setHealthy] = useState<boolean | null>(appConfig.useMock ? true : null);

  const refresh = useCallback(async () => {
    if (appConfig.useMock) {
      setHealthy(true);
      return;
    }
    const ok = await checkHealth();
    setHealthy(ok);
  }, []);

  useEffect(() => {
    void refresh();
    if (appConfig.useMock) return;
    const id = window.setInterval(() => void refresh(), pollMs);
    return () => window.clearInterval(id);
  }, [pollMs, refresh]);

  return { healthy, refresh, checking: !appConfig.useMock && healthy === null };
}
