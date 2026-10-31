import type { ReactNode } from 'react';
import { useEffect, useId } from 'react';
import { GlassPanel } from '@/components/brand';
import { cn } from '@/utils/cn';

type AppDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** z-index layer — default 50; use higher when stacking over sidebar modals */
  layer?: 'default' | 'above';
};

export function AppDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  layer = 'default',
}: AppDialogProps) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const z = layer === 'above' ? 'z-[60]' : 'z-50';

  return (
    <div
      className={cn('fixed inset-0 flex items-center justify-center p-4', z)}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn('relative z-10 w-full max-w-sm', className)}
      >
        <GlassPanel compact className="p-5 shadow-lg">
          <h2 id={titleId} className="text-sm font-semibold">
            {title}
          </h2>
          {description ? (
            <p id={descId} className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
          {children ? <div className={cn(description ? 'mt-3' : 'mt-2')}>{children}</div> : null}
          {footer ? <div className="mt-4 flex justify-end gap-2">{footer}</div> : null}
        </GlassPanel>
      </div>
    </div>
  );
}
