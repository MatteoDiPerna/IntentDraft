import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getPorts } from '@/adapters';
import type { AppPorts } from '@/adapters/types';

const PortsContext = createContext<AppPorts | null>(null);

export function PortsProvider({ children }: { children: ReactNode }) {
  const ports = useMemo(() => getPorts(), []);
  return <PortsContext.Provider value={ports}>{children}</PortsContext.Provider>;
}

export function usePorts(): AppPorts {
  const ctx = useContext(PortsContext);
  if (!ctx) throw new Error('usePorts must be used within PortsProvider');
  return ctx;
}
