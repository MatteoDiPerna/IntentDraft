import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

const tabs = [
  { to: '/app/admin', end: true, key: 'dashboard' as const },
  { to: '/app/admin/users', end: false, key: 'users' as const },
  { to: '/app/admin/usage', end: false, key: 'usage' as const },
  { to: '/app/admin/prompts', end: false, key: 'prompts' as const },
  { to: '/app/admin/platform', end: false, key: 'platform' as const },
];

export function AdminLayout() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="brand-heading-page">{t('admin.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.subtitle')}</p>
      </div>
      <nav className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )
            }
          >
            {t(`admin.tabs.${tab.key}`)}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
