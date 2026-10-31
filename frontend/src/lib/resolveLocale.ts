import type { Locale } from '@/types/auth';

/** Normalizes i18next language tags (e.g. `en-US`) to app locales. */
export function resolveLocale(language: string | undefined): Locale {
  if (!language) return 'it';
  const base = language.split('-')[0]?.toLowerCase();
  return base === 'en' ? 'en' : 'it';
}
