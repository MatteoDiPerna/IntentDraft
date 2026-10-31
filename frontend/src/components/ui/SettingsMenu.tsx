import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SegmentToggle } from '@/components/ui/SegmentToggle';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';
import type { Locale } from '@/types/auth';
import { STORAGE } from '@/lib/storageKeys';
import { resolveLocale } from '@/lib/resolveLocale';
import { cn } from '@/utils/cn';

export function SettingsMenu() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { user, setUser: setAuthUser } = useAuth();
  const ports = usePorts();
  const showError = useApiErrorToast();
  const { theme, setTheme } = useTheme();

  const locale = resolveLocale(i18n.language);

  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onLocale = (next: Locale) => {
    void i18n.changeLanguage(next);
    localStorage.setItem(STORAGE.locale, next);
    if (!user) return;
    void ports.user
      .updateProfile({ locale: next })
      .then((updated) => setAuthUser(updated))
      .catch((e) => showError(e));
  };

  const onTheme = (next: 'light' | 'dark') => setTheme(next);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t('nav.settings')}
        onClick={() => setOpen((v) => !v)}
      >
        <Settings className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <div
        role="dialog"
        aria-label={t('nav.settings')}
        className={cn(
          'absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-4 shadow-md',
          open ? 'block' : 'hidden',
        )}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t('nav.language')}</p>
            <SegmentToggle
              aria-label={t('nav.language')}
              value={locale}
              options={[
                { value: 'it', label: 'IT' },
                { value: 'en', label: 'EN' },
              ]}
              onChange={onLocale}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t('nav.theme')}</p>
            <SegmentToggle
              aria-label={t('nav.theme')}
              value={resolvedTheme}
              options={[
                { value: 'light', label: t('nav.themeLight') },
                { value: 'dark', label: t('nav.themeDark') },
              ]}
              onChange={onTheme}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Lingua e tema per visitatori non autenticati (home, login). */
export function GuestSettingsMenu() {
  const { user } = useAuth();
  if (user) return null;
  return <SettingsMenu />;
}
