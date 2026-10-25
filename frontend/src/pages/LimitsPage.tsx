import { useTranslation } from 'react-i18next';

export function LimitsPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-2xl py-8 space-y-4">
      <h1 className="text-2xl font-bold">{t('limits.title')}</h1>
      <p className="text-muted-foreground leading-relaxed">{t('limits.body')}</p>
    </div>
  );
}
