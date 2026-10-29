import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { GuestSettingsMenu } from './SettingsMenu';
import { UserMenu } from './UserMenu';
import { pageGutter } from '@/lib/layout';

interface NavbarProps {
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className={`flex h-16 w-full items-center justify-between ${pageGutter}`}>
        <Link to={user ? '/app' : '/'} className="flex items-center space-x-2">
          <span className="text-xl font-bold text-brand-gradient">{t('app.name')}</span>
        </Link>
        <div className="flex items-center gap-1">
          {!user && <GuestSettingsMenu />}
          {user && <UserMenu />}
          {children}
        </div>
      </div>
    </header>
  );
};
