import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
  /** Smaller radius/shadow — composer cards, result blocks. */
  compact?: boolean;
};

export function GlassPanel({ children, className, compact }: GlassPanelProps) {
  return (
    <div className={cn(compact ? 'surface-glass-compact' : 'surface-glass', className)}>
      {children}
    </div>
  );
}
