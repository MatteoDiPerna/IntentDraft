import { cn } from '@/utils/cn';

type SegmentToggleProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
  'aria-label'?: string;
};

export function SegmentToggle<T extends string>({
  value,
  options,
  onChange,
  className,
  'aria-label': ariaLabel,
}: SegmentToggleProps<T>) {
  const index = options.findIndex((o) => o.value === value);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'relative inline-flex rounded-lg border bg-muted p-0.5 text-xs font-medium',
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0.5 rounded-md bg-background shadow-sm transition-[left,width] duration-200 ease-out"
        style={{
          width: `calc(${100 / options.length}% - 2px)`,
          left: `calc(${(index * 100) / options.length}% + 1px)`,
        }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'relative z-10 flex-1 px-3 py-1.5 rounded-md transition-colors',
            value === opt.value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
