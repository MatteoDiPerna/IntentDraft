import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';
import { useToast } from '@/components/ui/toast';
import type { AdminUserDetail } from '@/types/admin';

type PendingAction = 'promote' | 'demote' | 'disable' | 'enable' | 'reset' | null;

export function AdminUserDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const ports = usePorts();
  const showError = useApiErrorToast();
  const toast = useToast();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);

  const reload = async () => {
    try {
      setUser(await ports.admin.getUser(id));
    } catch (e) {
      showError(e);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when id changes
  }, [id]);

  if (!user) {
    return <p className="text-sm text-muted-foreground">{t('admin.loading')}</p>;
  }

  const confirmMessage = () => {
    switch (pending) {
      case 'promote':
        return t('admin.users.confirmPromote');
      case 'demote':
        return t('admin.users.confirmDemote');
      case 'disable':
        return t('admin.users.confirmDisable');
      case 'enable':
        return t('admin.users.confirmEnable');
      case 'reset':
        return t('admin.users.confirmReset');
      default:
        return '';
    }
  };

  const onConfirm = async () => {
    const action = pending;
    setPending(null);
    try {
      if (action === 'promote') {
        await ports.admin.patchUser(id, { role: 'admin' });
      } else if (action === 'demote') {
        await ports.admin.patchUser(id, { role: 'user' });
      } else if (action === 'disable') {
        await ports.admin.patchUser(id, { status: 'disabled' });
      } else if (action === 'enable') {
        await ports.admin.patchUser(id, { status: 'active' });
      } else if (action === 'reset') {
        const res = await ports.admin.forcePasswordReset(id);
        toast(t('admin.users.resetSent'));
        if (res.devResetUrl) console.info('devResetUrl', res.devResetUrl);
      }
      await reload();
    } catch (e) {
      showError(e);
    }
  };

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/app/admin/users">{t('admin.users.back')}</Link>
      </Button>
      <GlassPanel className="space-y-3 p-5">
        <h2 className="text-lg font-semibold">{user.email}</h2>
        <p className="text-sm text-muted-foreground">
          {user.displayName} · {user.role} · {user.status}
        </p>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{t('admin.users.statsConversations')}</dt>
            <dd className="font-medium">{user.stats.conversations}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('admin.users.statsMessages')}</dt>
            <dd className="font-medium">{user.stats.messages}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('admin.users.statsLlm30')}</dt>
            <dd className="font-medium">{user.stats.llmCallsLast30Days}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2 pt-2">
          {user.role === 'user' ? (
            <Button size="sm" onClick={() => setPending('promote')}>
              {t('admin.users.promote')}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setPending('demote')}>
              {t('admin.users.demote')}
            </Button>
          )}
          {user.status === 'active' ? (
            <Button size="sm" variant="destructive" onClick={() => setPending('disable')}>
              {t('admin.users.disable')}
            </Button>
          ) : (
            <Button size="sm" onClick={() => setPending('enable')}>
              {t('admin.users.enable')}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setPending('reset')}>
            {t('admin.users.forceReset')}
          </Button>
        </div>
      </GlassPanel>
      <ConfirmModal
        open={pending != null}
        title={t('admin.users.confirmTitle')}
        message={confirmMessage()}
        confirmLabel={t('admin.users.confirmOk')}
        cancelLabel={t('admin.users.confirmCancel')}
        onConfirm={() => void onConfirm()}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
