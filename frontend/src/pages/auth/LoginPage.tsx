import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthPageShell } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { loginSchema, type LoginForm } from '@/schemas/auth';
import { appConfig } from '@/config';

export function LoginPage() {
  const { t } = useTranslation();
  const { user, status, login, loginDemo, loginWithGoogle } = useAuth();
  const showError = useApiErrorToast();
  const location = useLocation();
  const [params] = useSearchParams();
  const from = (location.state as { from?: string })?.from ?? '/app';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (params.get('oauth') === 'error') {
      setError('root', { message: t('auth.googleError') });
    }
  }, [params, setError, t]);

  if (status === 'authenticated' && user) return <Navigate to={from} replace />;

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
    } catch (e) {
      showError(e, 'auth.loginError');
      setError('root', { message: t('auth.loginError') });
    }
  };

  return (
    <AuthPageShell>
      <div>
        <h1 className="brand-heading-page">{t('auth.login')}</h1>
        {appConfig.useMock && (
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.mockNotice')}</p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        className="brand-btn-outline-glass w-full gap-2"
        onClick={() => void loginWithGoogle()}
      >
        {t('auth.continueWithGoogle')}
      </Button>

      <div className="brand-divider flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t('auth.orEmail')}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="brand-field"
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="brand-field"
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="cursor-default">{t('auth.forgotPassword')}</span>
        </p>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <Button type="submit" className="brand-btn-glow w-full" disabled={isSubmitting}>
          {t('auth.login')}
        </Button>
      </form>
      {appConfig.useMock && (
        <div className="brand-divider space-y-2 pt-4">
          <Button type="button" variant="secondary" className="w-full" onClick={() => void loginDemo()}>
            {t('auth.demoLogin')}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t('auth.demoHint')}</p>
        </div>
      )}
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          {t('auth.register')}
        </Link>
      </p>
    </AuthPageShell>
  );
}
