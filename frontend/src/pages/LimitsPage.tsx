import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel, PublicPageFrame } from '@/components/brand';
import { request } from '@/api/client';
import { API } from '@/api/endpoints';
import { appConfig } from '@/config';
import { resolveLocale } from '@/lib/resolveLocale';

export function LimitsPage() {
  const { t, i18n } = useTranslation();
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    if (appConfig.useMock) return;
    const locale = resolveLocale(i18n.language);
    void (async () => {
      try {
        const data = await request<{ markdown: string | null }>(
          'GET',
          `${API.public.legal}?page=limits&locale=${locale}`,
        );
        if (data.markdown?.trim()) setBody(data.markdown);
      } catch {
        /* fallback i18n */
      }
    })();
  }, [i18n.language]);

  const content = body ?? t('limits.body');

  return (
    <PublicPageFrame>
      <GlassPanel className="page-content-layer w-full max-w-2xl space-y-4 p-6 sm:p-8">
        <h1 className="brand-heading-page">{t('limits.title')}</h1>
        <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{content}</div>
      </GlassPanel>
    </PublicPageFrame>
  );
}
