import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppDialog } from '@/components/ui/AppDialog';

type PromptDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  label: string;
  defaultValue?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  layer?: 'default' | 'above';
};

export function PromptDialog({
  open,
  title,
  description,
  label,
  defaultValue = '',
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  layer,
}: PromptDialogProps) {
  const inputId = useId();
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open, defaultValue]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <AppDialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      layer={layer}
      footer={
        <>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" size="sm" className="brand-btn-glow" disabled={!value.trim()} onClick={submit}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          id={inputId}
          ref={inputRef}
          value={value}
          className="brand-field"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
        />
      </div>
    </AppDialog>
  );
}
