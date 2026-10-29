import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api/client';
import { useToast } from '@/components/ui/toast';

export function useApiErrorToast() {
  const { t } = useTranslation();
  const toast = useToast();

  return useCallback(
    (err: unknown, fallbackKey = 'errors.generic') => {
      if (err instanceof ApiError) {
        const key = `errors.${err.code}`;
        const msg = t(key, { defaultValue: err.message });
        toast(msg);
        return err.retryable;
      }
      toast(t(fallbackKey));
      return false;
    },
    [t, toast],
  );
}
