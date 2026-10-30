import { useTranslation } from 'react-i18next';
import { appConfig } from '@/config';
import { openGoogleOAuthPopup } from '@/lib/googleOAuthPopup';
import { cn } from '@/utils/cn';
import { GoogleIcon } from './GoogleIcon';

const googleBtnClass =
  'inline-flex h-10 w-full items-center justify-center gap-3 rounded border border-[#747775] bg-white px-3 text-sm font-medium text-[#1f1f1f] shadow-sm transition hover:bg-[#f8faff] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

type GoogleSignInButtonProps = {
  onMockSignIn?: () => void | Promise<void>;
  onOAuthSuccess?: () => void;
  onOAuthError?: (reason?: string) => void;
  disabled?: boolean;
  className?: string;
};

export function GoogleSignInButton({
  onMockSignIn,
  onOAuthSuccess,
  onOAuthError,
  disabled,
  className,
}: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const label = t('auth.continueWithGoogle');

  const content = (
    <>
      <GoogleIcon />
      <span>{label}</span>
    </>
  );

  const handleApiClick = () => {
    openGoogleOAuthPopup({
      onSuccess: () => onOAuthSuccess?.(),
      onError: (reason) => onOAuthError?.(reason),
    });
  };

  if (appConfig.useMock) {
    return (
      <button
        type="button"
        className={cn(googleBtnClass, className)}
        disabled={disabled}
        onClick={() => void onMockSignIn?.()}
      >
        {content}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(googleBtnClass, className)}
      disabled={disabled}
      aria-label={label}
      onClick={handleApiClick}
    >
      {content}
    </button>
  );
}
