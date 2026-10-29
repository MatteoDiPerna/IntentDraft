import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { appConfig } from '@/config';

export function BackendHealthBanner() {
  const { t } = useTranslation();
  const { healthy, refresh, checking } = useBackendHealth();

  if (appConfig.useMock || checking || healthy) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive sm:text-sm"
      role="status"
    >
      <span>{t('appShell.backendUnavailable')}</span>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => void refresh()}>
        {t('chat.retry')}
      </Button>
    </div>
  );
}
