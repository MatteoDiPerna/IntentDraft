import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import type { Locale } from '@/types/auth';
import { STORAGE } from '@/lib/storageKeys';
import { Button } from './button';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const user = useAuthStore((s) => s.currentUser);
  const setLocale = useAuthStore((s) => s.setLocale);

  const toggle = () => {
    const next: Locale = i18n.language === 'it' ? 'en' : 'it';
    void i18n.changeLanguage(next);
    localStorage.setItem(STORAGE.locale, next);
    if (user) setLocale(next);
  };

  return (
    <Button variant="outline" size="sm" onClick={toggle} aria-label={t('nav.language')}>
      {i18n.language === 'it' ? 'EN' : 'IT'}
    </Button>
  );
}
