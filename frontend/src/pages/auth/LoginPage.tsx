import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { appConfig } from '@/config';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type Form = z.infer<typeof schema>;

export function LoginPage() {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const loginDemo = useAuthStore((s) => s.loginDemo);
  const user = useAuthStore((s) => s.currentUser);
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/app';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to={from} replace />;

  const onSubmit = (data: Form) => {
    const ok = login(data.email, data.password);
    if (!ok) setError('root', { message: t('auth.loginError') });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full">
      <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('auth.login')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('auth.mockNotice')}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {t('auth.login')}
        </Button>
      </form>
      {appConfig.useMock && (
        <div className="space-y-2 pt-2 border-t">
          <Button type="button" variant="secondary" className="w-full" onClick={loginDemo}>
            {t('auth.demoLogin')}
          </Button>
          <p className="text-xs text-center text-muted-foreground">{t('auth.demoHint')}</p>
        </div>
      )}
      <p className="text-sm text-center">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-primary underline-offset-4 hover:underline">
          {t('auth.register')}
        </Link>
      </p>
      </div>
    </div>
  );
}
