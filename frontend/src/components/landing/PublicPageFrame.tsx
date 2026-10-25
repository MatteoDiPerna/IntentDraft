import type { ReactNode } from 'react';
import { LandingBackdrop } from '@/components/landing/LandingBackdrop';
import { cn } from '@/utils/cn';

type PublicPageFrameProps = {
  children: ReactNode;
  className?: string;
};

/** Full-bleed backdrop + vertical centering for pre-auth marketing/auth pages. */
export function PublicPageFrame({ children, className }: PublicPageFrameProps) {
  return (
    <div
      className={cn(
        'relative -mx-[30px] -my-6 flex min-h-[calc(100dvh-7.5rem)] flex-1 flex-col items-center justify-center px-[30px] py-10 sm:py-14',
        className,
      )}
    >
      <LandingBackdrop />
      {children}
    </div>
  );
}
