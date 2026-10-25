import type { ReactNode } from 'react';
import { BrandScene } from '@/components/brand/BrandScene';
import { cn } from '@/utils/cn';

type AppPanelFrameProps = {
  children: ReactNode;
  className?: string;
};

/** In-app main column (chat, etc.) with a softer brand scene. */
export function AppPanelFrame({ children, className }: AppPanelFrameProps) {
  return (
    <div className={cn('relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden', className)}>
      <BrandScene subtle />
      <div className="page-content-layer flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
