import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type Form = z.infer<typeof schema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const registerUser = useAuthStore((s) => s.register);
  const user = useAuthStore((s) => s.currentUser);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/app" replace />;

  const onSubmit = (data: Form) => {
    const ok = registerUser(data.email, data.password, data.displayName);
    if (!ok) setError('root', { message: t('auth.registerError') });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full">
      <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('auth.register')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('auth.mockNotice')}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">{t('auth.displayName')}</Label>
          <Input id="displayName" {...register('displayName')} />
          {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {t('auth.register')}
        </Button>
      </form>
      <p className="text-sm text-center">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
      </div>
    </div>
  );
}
