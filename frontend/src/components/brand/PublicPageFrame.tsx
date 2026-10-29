import type { ReactNode } from 'react';
import { BrandScene } from '@/components/brand/BrandScene';
import { cn } from '@/utils/cn';

type PublicPageFrameProps = {
  children: ReactNode;
  className?: string;
};

/** Marketing / auth pages: full-bleed scene + centered content. */
export function PublicPageFrame({ children, className }: PublicPageFrameProps) {
  return (
    <div className={cn('page-frame-public', className)}>
      <BrandScene subtle />
      {children}
    </div>
  );
}
