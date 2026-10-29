import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SettingsMenu } from '@/components/ui/SettingsMenu';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={rootRef} className="relative flex items-center gap-1">
      <SettingsMenu />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 max-w-[12rem]"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate hidden sm:inline">{user.displayName}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      </Button>
      <div
        role="menu"
        className={cn(
          'absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border bg-popover py-1 shadow-md',
          open ? 'block' : 'hidden',
        )}
      >
        <Link
          to="/app/settings"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
          onClick={() => setOpen(false)}
        >
          <Settings className="h-4 w-4" aria-hidden />
          {t('nav.settings')}
        </Link>
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
          onClick={() => {
            setOpen(false);
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
