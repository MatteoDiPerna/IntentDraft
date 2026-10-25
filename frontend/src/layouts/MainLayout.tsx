import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';
import { pageGutter } from '@/lib/layout';
import { cn } from '@/utils/cn';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isApp = pathname === '/app';

  return (
    <div
      className={cn(
        'flex flex-col bg-background',
        isApp ? 'h-screen overflow-hidden' : 'min-h-screen',
      )}
    >
      <Helmet>
        <title>{t('app.name')}</title>
        <meta name="description" content={t('app.tagline')} />
      </Helmet>
      <Navbar />
      <main
        className={cn(
          'flex min-h-0 w-full flex-1 flex-col',
          isApp ? 'overflow-hidden' : `${pageGutter} py-6`,
        )}
      >
        {children}
      </main>
      <footer
        className={cn(
          'shrink-0 border-t py-3 text-center text-sm text-muted-foreground',
          isApp ? 'px-[30px]' : pageGutter,
          !isApp && 'mt-auto',
        )}
      >
        <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-3">
          <p>© {new Date().getFullYear()} {t('app.name')}</p>
          <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            to="/limits"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t('nav.limits')}
          </Link>
        </div>
      </footer>
    </div>
  );
};
