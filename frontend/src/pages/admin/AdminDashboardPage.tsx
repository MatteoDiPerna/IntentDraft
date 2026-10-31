import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '@/components/brand';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';
import type { AdminMetricsOverview } from '@/types/admin';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const ports = usePorts();
  const showError = useApiErrorToast();
  const [data, setData] = useState<AdminMetricsOverview | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setData(await ports.admin.getMetricsOverview(7));
      } catch (e) {
        showError(e);
      }
    })();
  }, [ports.admin, showError]);

  if (!data) {
    return <p className="text-sm text-muted-foreground">{t('admin.loading')}</p>;
  }

  const cards = [
    { label: t('admin.metrics.usersTotal'), value: data.users.total },
    { label: t('admin.metrics.usersNew7'), value: data.users.newLast7Days },
    { label: t('admin.metrics.conversations'), value: data.conversations.total },
    { label: t('admin.metrics.messages7'), value: data.conversations.messagesLast7Days },
    { label: t('admin.metrics.llmCalls7'), value: data.llm.callsLast7Days },
    { label: t('admin.metrics.tokensIn7'), value: data.llm.inputTokensLast7Days },
    {
      label: t('admin.metrics.promptReadyRate'),
      value: `${Math.round(data.conversations.promptReadyRate * 100)}%`,
    },
    { label: t('admin.metrics.dbOk'), value: data.system.dbOk ? 'OK' : '—' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <GlassPanel key={c.label} className="p-4">
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{c.value}</p>
        </GlassPanel>
      ))}
    </div>
  );
}
