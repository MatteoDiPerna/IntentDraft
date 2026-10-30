import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GOOGLE_OAUTH_MESSAGE_TYPE } from '@/lib/googleOAuthPopup';

/** Loaded inside the OAuth popup; notifies opener and closes. */
export function GoogleOAuthPopupPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();

  useEffect(() => {
    const origin = window.location.origin;
    const success = params.get('success') === '1';
    const oauthError = params.get('oauth') === 'error';

    if (success) {
      window.opener?.postMessage({ type: GOOGLE_OAUTH_MESSAGE_TYPE, success: true }, origin);
      window.close();
      return;
    }

    if (oauthError) {
      window.opener?.postMessage(
        {
          type: GOOGLE_OAUTH_MESSAGE_TYPE,
          success: false,
          reason: params.get('reason') ?? undefined,
        },
        origin,
      );
      window.close();
    }
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center text-sm text-muted-foreground">
      {t('auth.googlePopupClosing')}
    </div>
  );
}
