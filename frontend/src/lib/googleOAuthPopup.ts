import { appConfig } from '@/config';

export const GOOGLE_OAUTH_MESSAGE_TYPE = 'intentdraft:google-oauth' as const;

/** Centered popup (~Google sign-in dialog size). */
export const GOOGLE_OAUTH_POPUP_FEATURES =
  'popup=yes,width=520,height=640,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes';

export type GoogleOAuthMessage =
  | { type: typeof GOOGLE_OAUTH_MESSAGE_TYPE; success: true }
  | { type: typeof GOOGLE_OAUTH_MESSAGE_TYPE; success: false; reason?: string };

export function googleOAuthStartUrl(popup = true): string {
  const base = appConfig.googleAuthStartUrl;
  if (!popup) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}popup=1`;
}

export function openGoogleOAuthPopup(handlers: {
  onSuccess: () => void;
  onError: (reason?: string) => void;
}): void {
  const popup = window.open(
    googleOAuthStartUrl(true),
    'intentdraft-google-oauth',
    GOOGLE_OAUTH_POPUP_FEATURES,
  );

  if (!popup) {
    handlers.onError('popup_blocked');
    return;
  }

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data as GoogleOAuthMessage | undefined;
    if (!data || data.type !== GOOGLE_OAUTH_MESSAGE_TYPE) return;

    cleanup();
    if (data.success) handlers.onSuccess();
    else handlers.onError(data.reason);
  };

  const poll = window.setInterval(() => {
    if (popup.closed) cleanup();
  }, 400);

  function cleanup() {
    window.removeEventListener('message', onMessage);
    window.clearInterval(poll);
  }

  window.addEventListener('message', onMessage);
}
