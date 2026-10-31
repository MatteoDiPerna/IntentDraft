import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthPageShell } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';
import { resetPasswordFormSchema, type ResetPasswordForm } from '@/schemas/auth';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const ports = usePorts();
  const navigate = useNavigate();
  const showError = useApiErrorToast();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  if (!token) return <Navigate to="/forgot-password" replace />;

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      await ports.auth.resetPassword(token, data.newPassword);
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (e) {
      showError(e, 'auth.resetPasswordError');
    }
  };

  return (
    <AuthPageShell>
      <div>
        <h1 className="brand-heading-page">{t('auth.resetPasswordTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('auth.resetPasswordHint')}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
          <Input id="newPassword" type="password" className="brand-field" {...form.register('newPassword')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('settings.confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            className="brand-field"
            {...form.register('confirmPassword')}
          />
        </div>
        <Button type="submit" className="brand-btn-glow w-full">
          {t('auth.resetPasswordSubmit')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </AuthPageShell>
  );
}
