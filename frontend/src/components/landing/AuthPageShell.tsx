import type { ReactNode } from 'react';
import { PublicPageFrame } from '@/components/landing/PublicPageFrame';
import { cn } from '@/utils/cn';

type AuthPageShellProps = {
  children: ReactNode;
  className?: string;
};

export function AuthPageShell({ children, className }: AuthPageShellProps) {
  return (
    <PublicPageFrame>
      <div
        className={cn(
          'relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-primary/20 bg-background/55 p-6 shadow-xl shadow-primary/10 backdrop-blur-md sm:p-8',
          className,
        )}
      >
        {children}
      </div>
    </PublicPageFrame>
  );
}
