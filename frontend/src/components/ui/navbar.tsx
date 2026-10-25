import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Button } from './button';
import { GuestSettingsMenu, SettingsMenu } from './SettingsMenu';
import { pageGutter } from '@/lib/layout';

interface NavbarProps {
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className={`flex h-16 w-full items-center justify-between ${pageGutter}`}>
        <Link to={user ? '/app' : '/'} className="flex items-center space-x-2">
          <span className="text-xl font-bold text-brand-gradient">{t('app.name')}</span>
        </Link>
        <div className="flex items-center gap-1">
          <GuestSettingsMenu />
          {user && (
            <>
              <SettingsMenu />
              <span className="text-sm text-muted-foreground hidden sm:inline px-1">{user.displayName}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t('nav.logout')}
              </Button>
            </>
          )}
          {children}
        </div>
      </div>
    </header>
  );
};
