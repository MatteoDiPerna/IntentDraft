import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';
import { useToast } from '@/components/ui/toast';
import type { AdminPlatformSettings } from '@/types/admin';

export function AdminPlatformPage() {
  const { t } = useTranslation();
  const ports = usePorts();
  const showError = useApiErrorToast();
  const toast = useToast();
  const [settings, setSettings] = useState<AdminPlatformSettings | null>(null);
  const [maintenance, setMaintenance] = useState(false);
  const [legalPage, setLegalPage] = useState<'limits' | 'privacy' | 'terms'>('limits');
  const [legalLocale, setLegalLocale] = useState<'it' | 'en'>('it');
  const [legalMarkdown, setLegalMarkdown] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const s = await ports.admin.getPlatformSettings();
        setSettings(s);
        setMaintenance(Boolean(s.overrides['features.maintenanceMode']));
        const legal = await ports.admin.getLegalContent();
        const row = legal.pages.find((p) => p.page === legalPage && p.locale === legalLocale);
        setLegalMarkdown(row?.markdown ?? '');
      } catch (e) {
        showError(e);
      }
    })();
  }, [ports.admin, showError, legalPage, legalLocale]);

  if (!settings) {
    return <p className="text-sm text-muted-foreground">{t('admin.loading')}</p>;
  }

  const onSaveFlags = async () => {
    try {
      await ports.admin.putPlatformSettings({ 'features.maintenanceMode': maintenance });
      toast(t('admin.platform.saved'));
    } catch (e) {
      showError(e);
    }
  };

  const onSaveLegal = async () => {
    try {
      await ports.admin.putLegalContent({ page: legalPage, locale: legalLocale, markdown: legalMarkdown });
      toast(t('admin.platform.legalSaved'));
    } catch (e) {
      showError(e);
    }
  };

  return (
    <div className="space-y-4">
      <GlassPanel className="space-y-3 p-5">
        <h2 className="text-sm font-semibold">{t('admin.platform.envTitle')}</h2>
        <pre className="overflow-x-auto rounded-md bg-muted/40 p-3 text-xs">
          {JSON.stringify(settings.envReadOnly, null, 2)}
        </pre>
        <div className="flex items-center gap-2">
          <input
            id="maint"
            type="checkbox"
            checked={maintenance}
            onChange={(e) => setMaintenance(e.target.checked)}
          />
          <Label htmlFor="maint">{t('admin.platform.maintenance')}</Label>
        </div>
        <Button type="button" size="sm" onClick={() => void onSaveFlags()}>
          {t('admin.platform.saveFlags')}
        </Button>
      </GlassPanel>
      <GlassPanel className="space-y-3 p-5">
        <h2 className="text-sm font-semibold">{t('admin.platform.legalTitle')}</h2>
        <div className="flex flex-wrap gap-2">
          <select
            className="brand-field rounded-md border px-2 py-1 text-sm"
            value={legalPage}
            onChange={(e) => setLegalPage(e.target.value as typeof legalPage)}
          >
            <option value="limits">limits</option>
            <option value="privacy">privacy</option>
            <option value="terms">terms</option>
          </select>
          <select
            className="brand-field rounded-md border px-2 py-1 text-sm"
            value={legalLocale}
            onChange={(e) => setLegalLocale(e.target.value as typeof legalLocale)}
          >
            <option value="it">it</option>
            <option value="en">en</option>
          </select>
        </div>
        <textarea
          className="brand-field min-h-[200px] w-full rounded-md border p-3 font-mono text-xs"
          value={legalMarkdown}
          onChange={(e) => setLegalMarkdown(e.target.value)}
        />
        <Button type="button" size="sm" onClick={() => void onSaveLegal()}>
          {t('admin.platform.saveLegal')}
        </Button>
      </GlassPanel>
    </div>
  );
}
