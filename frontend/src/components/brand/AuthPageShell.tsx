import type { ReactNode } from 'react';
import { GlassPanel } from '@/components/brand/GlassPanel';
import { PublicPageFrame } from '@/components/brand/PublicPageFrame';
import { cn } from '@/utils/cn';

type AuthPageShellProps = {
  children: ReactNode;
  className?: string;
};

export function AuthPageShell({ children, className }: AuthPageShellProps) {
  return (
    <PublicPageFrame>
      <GlassPanel className={cn('page-content-layer w-full max-w-md space-y-6 p-6 sm:p-8', className)}>
        {children}
      </GlassPanel>
    </PublicPageFrame>
  );
}
