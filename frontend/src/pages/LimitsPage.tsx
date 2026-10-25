import { useTranslation } from 'react-i18next';
import { GlassPanel, PublicPageFrame } from '@/components/brand';

export function LimitsPage() {
  const { t } = useTranslation();
  return (
    <PublicPageFrame>
      <GlassPanel className="page-content-layer w-full max-w-2xl space-y-4 p-6 sm:p-8">
        <h1 className="brand-heading-page">{t('limits.title')}</h1>
        <p className="leading-relaxed text-muted-foreground">{t('limits.body')}</p>
      </GlassPanel>
    </PublicPageFrame>
  );
}
