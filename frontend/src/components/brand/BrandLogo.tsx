import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { brandAssets, brandLogoSizes, type BrandLogoVariant } from '@/lib/brand';
import { cn } from '@/utils/cn';

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  className?: string;
  /** Wrap in home/app link (default true except when used inside another link). */
  linked?: boolean;
  /** Renders as button (e.g. expand sidebar). Mutually exclusive with linked. */
  onClick?: () => void;
};

export function BrandLogo({
  variant = 'sidebar',
  className,
  linked = true,
  onClick,
}: BrandLogoProps) {
  const { t } = useTranslation();
  const img = (
    <img
      src={brandAssets.logoTransparent}
      alt={t('app.name')}
      className={cn(brandLogoSizes[variant], 'object-contain', className)}
      width={variant === 'sidebarCollapsed' ? 48 : 160}
      height={variant === 'sidebarCollapsed' ? 44 : 32}
      decoding="async"
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          variant === 'sidebarCollapsed' && 'h-full min-h-[3rem] w-full px-0.5',
        )}
        aria-label={t('sidebar.expand')}
      >
        {img}
      </button>
    );
  }

  if (!linked) return img;

  return (
    <Link to="/app" className="inline-flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
      {img}
    </Link>
  );
}
