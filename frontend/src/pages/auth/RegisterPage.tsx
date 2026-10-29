import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthPageShell } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { registerSchema, type RegisterForm } from '@/schemas/auth';
import { appConfig } from '@/config';

export function RegisterPage() {
  const { t } = useTranslation();
  const { user, status, register: registerUser } = useAuth();
  const showError = useApiErrorToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  if (status === 'authenticated' && user) return <Navigate to="/app" replace />;

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.email, data.password, data.displayName);
    } catch (e) {
      showError(e, 'auth.registerError');
      setError('root', { message: t('auth.registerError') });
    }
  };

  return (
    <AuthPageShell>
      <div>
        <h1 className="brand-heading-page">{t('auth.register')}</h1>
        {appConfig.useMock && (
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.mockNotice')}</p>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">{t('auth.displayName')}</Label>
          <Input id="displayName" className="brand-field" {...register('displayName')} />
          {errors.displayName && (
            <p className="text-sm text-destructive">{errors.displayName.message}</p>
          )}
        </div>
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
            autoComplete="new-password"
            className="brand-field"
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <Button type="submit" className="brand-btn-glow w-full" disabled={isSubmitting}>
          {t('auth.register')}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </AuthPageShell>
  );
}
