import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Button } from './button';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to={user ? '/app' : '/'} className="flex items-center space-x-2">
            <span className="text-xl font-bold">{t('app.name')}</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/limits" className="text-sm font-medium transition-colors hover:text-primary">
              {t('nav.limits')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user && (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.displayName}</span>
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
