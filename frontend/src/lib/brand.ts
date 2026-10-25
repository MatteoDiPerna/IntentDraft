/** Brand assets live under `src/assets/brand/` (imported by Vite). Favicon in `public/`. */
import logoTransparent from '@/assets/brand/logo.png';
import logoSource from '@/assets/brand/logo-source.png';

/** HSL components (no `hsl()` wrapper) — keep in sync with `src/styles/brand-tokens.css`. */
export const brandColors = {
  navy: '219 46% 11%',
  navyElevated: '219 42% 14%',
  blue: '233 79% 52%',
  blueBright: '236 88% 67%',
  violet: '245 85% 62%',
} as const;

export const brandAssets = {
  logoTransparent,
  logoSource,
  favicon: '/favicon.ico',
} as const;

export type BrandLogoVariant = 'sidebar' | 'header' | 'mark' | 'sidebarCollapsed';

export const brandLogoSizes: Record<BrandLogoVariant, string> = {
  sidebar: 'h-8 w-auto max-w-[140px]',
  header: 'h-7 w-auto max-w-[120px]',
  mark: 'h-6 w-6',
  sidebarCollapsed: 'h-11 w-auto max-w-[48px] object-contain',
};
