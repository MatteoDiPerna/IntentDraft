import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GlassPanel } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { STORAGE } from '@/lib/storageKeys';
import { appConfig } from '@/config';
import { usePorts } from '@/providers/PortsProvider';

type ConsentChoice = 'accepted' | 'rejected';

/** Mock cookie banner — stores choice locally; session cookies still work regardless. */
export function CookieConsentBanner() {
  const { t } = useTranslation();
  const ports = usePorts();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE.cookieConsent);
    if (!stored) setVisible(true);
  }, []);

  const save = (choice: ConsentChoice) => {
    localStorage.setItem(STORAGE.cookieConsent, choice);
    setVisible(false);
    if (!appConfig.useMock) {
      void ports.admin.recordCookieConsent(choice).catch(() => undefined);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-5"
      role="region"
      aria-label={t('cookies.title')}
    >
      <GlassPanel compact className="mx-auto flex max-w-4xl flex-col gap-3 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
      </GlassPanel>
    </div>
  );
}
