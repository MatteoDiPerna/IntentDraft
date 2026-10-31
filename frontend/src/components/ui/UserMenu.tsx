import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SettingsMenu } from '@/components/ui/SettingsMenu';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const setSettingsExclusive = (open: boolean) => {
    setSettingsOpen(open);
    if (open) setUserOpen(false);
  };

  const setUserExclusive = (open: boolean) => {
    setUserOpen(open);
    if (open) setSettingsOpen(false);
  };

  useEffect(() => {
    if (!userOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setUserOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [userOpen]);

  if (!user) return null;

  return (
    <div ref={rootRef} className="relative flex items-center gap-1">
      <SettingsMenu open={settingsOpen} onOpenChange={setSettingsExclusive} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 max-w-[12rem]"
        aria-expanded={userOpen}
        aria-haspopup="menu"
        onClick={() => setUserExclusive(!userOpen)}
      >
        <span className="truncate hidden sm:inline">{user.displayName}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      </Button>
      <div
        role="menu"
        className={cn(
          'absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border bg-popover py-1 shadow-md',
          userOpen ? 'block' : 'hidden',
        )}
      >
        {user.role === 'admin' && (
          <Link
            to="/app/admin"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
            onClick={() => setUserOpen(false)}
          >
            <Shield className="h-4 w-4" aria-hidden />
            {t('nav.admin')}
          </Link>
        )}
        <Link
          to="/app/settings"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
          onClick={() => setUserOpen(false)}
        >
          <Settings className="h-4 w-4" aria-hidden />
          {t('nav.settings')}
        </Link>
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
          onClick={() => {
            setUserOpen(false);
            void logout();
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
}
