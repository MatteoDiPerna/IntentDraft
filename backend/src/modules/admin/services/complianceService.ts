import { prisma } from '../../../lib/db.js';
import { writeAdminAudit } from './auditService.js';

const LEGAL_PAGES = ['limits', 'privacy', 'terms'] as const;
const LEGAL_LOCALES = ['it', 'en'] as const;

function legalKey(page: string, locale: string): string {
  return `legal.${page}_${locale}`;
}

export async function getLegalPage(page: string, locale: string): Promise<string | null> {
  if (!LEGAL_PAGES.includes(page as (typeof LEGAL_PAGES)[number])) return null;
  if (!LEGAL_LOCALES.includes(locale as (typeof LEGAL_LOCALES)[number])) return null;
  const row = await prisma.platformConfig.findUnique({ where: { key: legalKey(page, locale) } });
  if (!row) return null;
  const text = String(row.value ?? '').trim();
  return text.length > 0 ? text : null;
}

export async function getLegalContent() {
  const keys = LEGAL_PAGES.flatMap((page) =>
    LEGAL_LOCALES.map((locale) => legalKey(page, locale)),
  );
  const rows = await prisma.platformConfig.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  return {
    pages: LEGAL_PAGES.flatMap((page) =>
      LEGAL_LOCALES.map((locale) => ({
        page,
        locale,
        markdown: String(map.get(legalKey(page, locale)) ?? ''),
      })),
    ),
  };
}

export async function putLegalContent(
  adminId: string,
  input: { page: string; locale: string; markdown: string },
) {
  if (!LEGAL_PAGES.includes(input.page as (typeof LEGAL_PAGES)[number])) {
    throw new Error('invalid page');
  }
  if (!LEGAL_LOCALES.includes(input.locale as (typeof LEGAL_LOCALES)[number])) {
    throw new Error('invalid locale');
  }
  const key = legalKey(input.page, input.locale);
  await prisma.platformConfig.upsert({
    where: { key },
    create: { key, value: input.markdown, updatedBy: adminId },
    update: { value: input.markdown, updatedBy: adminId },
  });
  await writeAdminAudit({
    adminUserId: adminId,
    action: 'LEGAL_CONTENT_UPDATE',
    targetType: 'config',
    targetId: key,
  });
  return { ok: true as const };
}

export async function recordCookieConsent(userId: string | null, choice: 'accepted' | 'rejected') {
  await prisma.cookieConsentLog.create({
    data: { userId, choice },
  });
  return { ok: true as const };
}

export async function getCookieConsentSummary() {
  const [accepted, rejected, recent] = await Promise.all([
    prisma.cookieConsentLog.count({ where: { choice: 'accepted' } }),
    prisma.cookieConsentLog.count({ where: { choice: 'rejected' } }),
    prisma.cookieConsentLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { email: true } } },
    }),
  ]);

  return {
    totals: { accepted, rejected },
    recent: recent.map((r) => ({
      id: r.id,
      choice: r.choice,
      userEmail: r.user?.email ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
