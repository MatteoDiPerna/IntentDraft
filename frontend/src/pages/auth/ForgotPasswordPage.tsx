import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ApiError } from '@/api/client';
import { AuthPageShell } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';

const schema = z.object({ email: z.string().email() });
type Form = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const ports = usePorts();
  const showError = useApiErrorToast();
  const [devResetPath, setDevResetPath] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    clearErrors();
    try {
      const res = await ports.auth.requestPasswordReset(data.email);
      setSent(true);
      setDevResetPath(null);
      if (res.devResetUrl) {
        try {
          const url = new URL(res.devResetUrl);
          setDevResetPath(`${url.pathname}${url.search}`);
        } catch {
          setDevResetPath(null);
        }
      }
    } catch (e) {
      if (e instanceof ApiError && e.code === 'EMAIL_NOT_REGISTERED') {
        setError('email', { message: t('auth.forgotPasswordEmailUnknown') });
        return;
      }
      if (e instanceof ApiError && e.code === 'PASSWORD_RESET_UNAVAILABLE') {
        setError('root', { message: t('auth.forgotPasswordGoogleOnly') });
        return;
      }
      showError(e);
    }
  };

  return (
    <AuthPageShell>
      <div>
        <h1 className="brand-heading-page">{t('auth.forgotPasswordTitle')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('auth.forgotPasswordHint')}</p>
      </div>

      {sent ? (
        <div className="space-y-3 text-sm">
          <p>{t('auth.forgotPasswordSent')}</p>
          {devResetPath ? (
            <p className="rounded-md border bg-muted/40 p-3 text-xs break-all">
              <span className="font-medium">{t('auth.forgotPasswordDevLink')}</span>{' '}
              <Link to={devResetPath} className="text-primary underline">
                {t('auth.resetPasswordTitle')}
              </Link>
            </p>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input id="email" type="email" autoComplete="email" className="brand-field" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          <Button type="submit" className="brand-btn-glow w-full" disabled={isSubmitting}>
            {t('auth.forgotPasswordSubmit')}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </AuthPageShell>
  );
}
