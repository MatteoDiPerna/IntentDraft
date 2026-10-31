import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';
import type { AdminUserListItem } from '@/types/admin';

export function AdminUsersPage() {
  const { t } = useTranslation();
  const ports = usePorts();
  const showError = useApiErrorToast();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const tmr = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(tmr);
  }, [q]);

  const load = useCallback(async () => {
    try {
      const res = await ports.admin.listUsers({ page, pageSize, q: debouncedQ || undefined });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      showError(e);
    }
  }, [ports.admin, page, debouncedQ, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <GlassPanel className="space-y-4 p-4">
      <Input
        className="brand-field max-w-md"
        placeholder={t('admin.users.search')}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-2 pr-3">{t('admin.users.email')}</th>
              <th className="py-2 pr-3">{t('admin.users.role')}</th>
              <th className="py-2 pr-3">{t('admin.users.status')}</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-b border-border/60">
                <td className="py-2 pr-3">
                  <div className="font-medium">{u.email}</div>
                  <div className="text-xs text-muted-foreground">{u.displayName}</div>
                </td>
                <td className="py-2 pr-3">{u.role}</td>
                <td className="py-2 pr-3">{u.status}</td>
                <td className="py-2 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/app/admin/users/${u.id}`}>{t('admin.users.detail')}</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t('admin.users.total', { count: total })}</span>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('admin.pagination.prev')}
          </Button>
          <span className="tabular-nums">
            {page} / {pages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('admin.pagination.next')}
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
}
