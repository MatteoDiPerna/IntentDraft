import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';

export function HomePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.currentUser);
  if (user) return <Navigate to="/app" replace />;

  return (
    <div className="max-w-xl mx-auto py-16 space-y-6 text-center">
      <h1 className="text-3xl font-bold text-brand-gradient">{t('app.name')}</h1>
      <p className="text-muted-foreground">{t('app.tagline')}</p>
      <div className="flex gap-4 justify-center">
        <Button asChild>
          <Link to="/login">{t('auth.login')}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/register">{t('auth.register')}</Link>
        </Button>
      </div>
    </div>
  );
}
