import { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type FileInputButtonProps = {
  label: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onFiles: (files: FileList | null) => void;
};

export function FileInputButton({
  label,
  multiple,
  disabled,
  className,
  onFiles,
}: FileInputButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          onFiles(e.target.files);
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        className={cn('gap-2', className)}
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </Button>
    </>
  );
}
