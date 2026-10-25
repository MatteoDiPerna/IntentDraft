import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/ui/navbar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t('app.name')}</title>
        <meta name="description" content={t('app.tagline')} />
      </Helmet>
      <Navbar>
        <ThemeToggle />
      </Navbar>
      <main className="container mx-auto py-6 px-4">{children}</main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} PromptPilot</p>
        </div>
      </footer>
    </div>
  );
};
