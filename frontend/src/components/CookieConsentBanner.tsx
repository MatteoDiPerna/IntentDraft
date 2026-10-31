import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { STORAGE } from '@/lib/storageKeys';

type ConsentChoice = 'accepted' | 'rejected';

/** Mock cookie banner — stores choice locally; session cookies still work regardless. */
export function CookieConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE.cookieConsent);
    if (!stored) setVisible(true);
  }, []);

  const save = (choice: ConsentChoice) => {
    localStorage.setItem(STORAGE.cookieConsent, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:p-5"
      role="region"
      aria-label={t('cookies.title')}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1 text-sm">
          <p className="font-medium">{t('cookies.title')}</p>
          <p className="text-muted-foreground">{t('cookies.description')}</p>
          <p className="text-xs text-muted-foreground">
            <Link to="/limits" className="text-primary underline-offset-4 hover:underline">
              {t('cookies.learnMore')}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => save('rejected')}>
            {t('cookies.reject')}
          </Button>
          <Button type="button" size="sm" className="brand-btn-glow" onClick={() => save('accepted')}>
            {t('cookies.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
