import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPageFrame } from '@/components/landing/PublicPageFrame';
import { brandAssets } from '@/lib/brand';
import { useAuthStore } from '@/store/authStore';

const featureIcons = [MessageSquare, Wand2, Sparkles] as const;

export function HomePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.currentUser);
  if (user) return <Navigate to="/app" replace />;

  const features = t('landing.features', { returnObjects: true }) as string[];

  return (
    <PublicPageFrame>
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-brand-gradient-subtle px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          {t('landing.badge')}
        </div>

        <img
          src={brandAssets.logoTransparent}
          alt=""
          className="mb-5 h-12 w-auto max-w-[200px] sm:h-14"
          width={200}
          height={48}
          decoding="async"
          aria-hidden
        />

        <h1 className="text-4xl font-bold tracking-tight text-brand-gradient sm:text-5xl sm:leading-tight">
          {t('app.name')}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('app.tagline')}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          <Button size="lg" className="min-w-[9rem] shadow-lg shadow-primary/25" asChild>
            <Link to="/login">{t('auth.login')}</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-w-[9rem] border-primary/30 bg-background/40 backdrop-blur-sm hover:bg-accent/70"
            asChild
          >
            <Link to="/register">{t('auth.register')}</Link>
          </Button>
        </div>

        <ul className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-2">
          {features.map((label, i) => {
            const Icon = featureIcons[i] ?? Sparkles;
            return (
              <li
                key={label}
                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </PublicPageFrame>
  );
}
