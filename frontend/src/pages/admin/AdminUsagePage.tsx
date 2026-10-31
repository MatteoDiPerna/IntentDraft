import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';

export function AdminUsagePage() {
  const { t } = useTranslation();
  const ports = usePorts();
  const showError = useApiErrorToast();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const onExport = async () => {
    try {
      const blob = await ports.admin.exportUsageCsv({ from: from || undefined, to: to || undefined });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'llm-usage.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showError(e);
    }
  };

  return (
    <GlassPanel className="max-w-lg space-y-4 p-5">
      <h2 className="text-sm font-semibold">{t('admin.usage.title')}</h2>
      <p className="text-sm text-muted-foreground">{t('admin.usage.hint')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="from">{t('admin.usage.from')}</Label>
          <Input id="from" type="date" className="brand-field" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to">{t('admin.usage.to')}</Label>
          <Input id="to" type="date" className="brand-field" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <Button type="button" className="brand-btn-glow" onClick={() => void onExport()}>
        {t('admin.usage.export')}
      </Button>
    </GlassPanel>
  );
}
