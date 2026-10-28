import { useEffect, useId, useRef } from 'react';
import { GlassPanel } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  className,
}: ConfirmModalProps) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-sm"
      >
        <GlassPanel compact className={cn('p-5 shadow-lg', className)}>
          {title ? (
            <h2 id={titleId} className="text-sm font-semibold">
              {title}
            </h2>
          ) : null}
          <p id={descId} className={cn('text-sm text-muted-foreground', title && 'mt-2')}>
            {message}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" ref={cancelRef} onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button type="button" size="sm" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
