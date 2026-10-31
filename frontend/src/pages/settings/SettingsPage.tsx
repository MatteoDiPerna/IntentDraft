import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppPanelFrame, GlassPanel } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentToggle } from '@/components/ui/SegmentToggle';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';
import { changePasswordSchema, profileSchema, type ChangePasswordForm, type ProfileForm } from '@/schemas/profile';
import type { Locale } from '@/types/auth';
import { useToast } from '@/components/ui/toast';
import { appConfig } from '@/config';
import { resolveLocale } from '@/lib/resolveLocale';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, setUser: setAuthUser } = useAuth();
  const ports = usePorts();
  const showError = useApiErrorToast();
  const toast = useToast();
  const { theme, setTheme } = useTheme();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName ?? '' },
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  if (!user) return null;

  const locale = resolveLocale(i18n.language);
  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  const onProfile = async (data: ProfileForm) => {
    try {
      const updated = await ports.user.updateProfile({ displayName: data.displayName });
      setAuthUser(updated);
      toast(t('settings.saved'));
    } catch (e) {
      showError(e);
    }
  };

  const onLocale = async (next: Locale) => {
    void i18n.changeLanguage(next);
    try {
      const updated = await ports.user.updateProfile({ locale: next });
      setAuthUser(updated);
    } catch (e) {
      showError(e);
    }
  };

  const onPassword = async (data: ChangePasswordForm) => {
    try {
      await ports.user.changePassword(data.currentPassword, data.newPassword);
      passwordForm.reset();
      toast(t('settings.passwordUpdated'));
    } catch (e) {
      showError(e, 'settings.passwordError');
    }
  };

  return (
    <AppPanelFrame>
      <div className="mx-auto w-full max-w-lg space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="brand-heading-page">{t('settings.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        <GlassPanel className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">{t('settings.profile')}</h2>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            {user.authProvider === 'google' ? t('settings.providerGoogle') : t('settings.providerLocal')}
          </p>
          <form onSubmit={profileForm.handleSubmit(onProfile)} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('auth.displayName')}</Label>
              <Input id="displayName" className="brand-field" {...profileForm.register('displayName')} />
            </div>
            <Button type="submit" size="sm" className="brand-btn-glow">
              {t('settings.saveProfile')}
            </Button>
          </form>
        </GlassPanel>

        <GlassPanel className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">{t('settings.preferences')}</h2>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t('nav.language')}</p>
            <SegmentToggle
              aria-label={t('nav.language')}
              value={locale}
              options={[
                { value: 'it', label: 'IT' },
                { value: 'en', label: 'EN' },
              ]}
              onChange={onLocale}
              className="w-full max-w-xs"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t('nav.theme')}</p>
            <SegmentToggle
              aria-label={t('nav.theme')}
              value={resolvedTheme}
              options={[
                { value: 'light', label: t('nav.themeLight') },
                { value: 'dark', label: t('nav.themeDark') },
              ]}
              onChange={(v) => setTheme(v)}
              className="w-full max-w-xs"
            />
          </div>
        </GlassPanel>

        <GlassPanel className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">{t('settings.security')}</h2>
          {user.hasPassword ? (
            <form onSubmit={passwordForm.handleSubmit(onPassword)} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('settings.currentPassword')}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="brand-field"
                  {...passwordForm.register('currentPassword')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="brand-field"
                  {...passwordForm.register('newPassword')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('settings.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="brand-field"
                  {...passwordForm.register('confirmPassword')}
                />
              </div>
              <Button type="submit" size="sm" variant="secondary">
                {t('settings.changePassword')}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">{t('settings.noPasswordAccount')}</p>
          )}
          <p className="text-sm">
            <Link to="/limits" className="text-primary underline-offset-4 hover:underline">
              {t('nav.limits')}
            </Link>
          </p>
        </GlassPanel>

        {appConfig.useMock && (
          <p className="text-center text-xs text-muted-foreground">{t('settings.mockNote')}</p>
        )}
      </div>
    </AppPanelFrame>
  );
}
