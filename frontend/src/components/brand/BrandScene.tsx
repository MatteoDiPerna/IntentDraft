import { cn } from '@/utils/cn';

type BrandSceneProps = {
  /** Softer glow/grid for in-app panels (e.g. chat). */
  subtle?: boolean;
  className?: string;
};

/** Decorative AI-style background — CSS only, pointer-events none. */
export function BrandScene({ subtle, className }: BrandSceneProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        subtle && 'brand-scene-subtle',
        className,
      )}
      aria-hidden
    >
      <div className="brand-scene-glow-main brand-scene-glow-pulse absolute left-1/2 top-[38%] h-[min(520px,70vw)] w-[min(520px,70vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/25 blur-[100px] dark:bg-brand-blue-bright/20" />
      <div className="absolute -right-24 top-20 h-64 w-64 rounded-full bg-brand-violet/15 blur-[80px] dark:bg-brand-violet/20" />
      <div className="absolute -left-16 bottom-24 h-48 w-48 rounded-full bg-brand-blue/10 blur-[72px] dark:bg-brand-blue-bright/10" />
      <div
        className={cn(
          'brand-scene-grid absolute inset-0 opacity-[0.35] dark:opacity-[0.22]',
          subtle && 'opacity-[0.22] dark:opacity-[0.14]',
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
    </div>
  );
}
