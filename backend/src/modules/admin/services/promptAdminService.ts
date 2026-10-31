import { prisma } from '../../../lib/db.js';
import { writeAdminAudit } from './auditService.js';

export async function listPromptTemplates() {
  const rows = await prisma.platformPromptTemplate.findMany({
    orderBy: [{ key: 'asc' }, { provider: 'asc' }, { version: 'desc' }],
    take: 200,
  });

  const byKey = new Map<string, typeof rows>();
  for (const row of rows) {
    const k = `${row.key}:${row.provider}`;
    const list = byKey.get(k) ?? [];
    list.push(row);
    byKey.set(k, list);
  }

  return {
    groups: [...byKey.entries()].map(([compound, versions]) => {
      const [key, provider] = compound.split(':');
      const active = versions.find((v) => v.active) ?? null;
      return {
        key,
        provider,
        active: active
          ? {
              id: active.id,
              version: active.version,
              body: active.body,
              updatedAt: active.updatedAt.toISOString(),
            }
          : null,
        recentVersions: versions.slice(0, 5).map((v) => ({
          id: v.id,
          version: v.version,
          active: v.active,
          updatedAt: v.updatedAt.toISOString(),
        })),
      };
    }),
  };
}

export async function upsertPromptTemplate(
  adminId: string,
  key: string,
  input: { provider: string; body: string; activate?: boolean },
) {
  const provider = input.provider.trim() || 'anthropic';
  const last = await prisma.platformPromptTemplate.findFirst({
    where: { key, provider },
    orderBy: { version: 'desc' },
  });
  const version = (last?.version ?? 0) + 1;

  const created = await prisma.$transaction(async (tx) => {
    if (input.activate !== false) {
      await tx.platformPromptTemplate.updateMany({
        where: { key, provider, active: true },
        data: { active: false },
      });
    }
    return tx.platformPromptTemplate.create({
      data: {
        key,
        provider,
        body: input.body,
        version,
        active: input.activate !== false,
        updatedBy: adminId,
      },
    });
  });

  await writeAdminAudit({
    adminUserId: adminId,
    action: 'PROMPT_TEMPLATE_UPSERT',
    targetType: 'prompt_template',
    targetId: `${key}:${provider}:v${version}`,
    metadata: { activate: input.activate !== false },
  });

  return {
    id: created.id,
    key: created.key,
    provider: created.provider,
    version: created.version,
    active: created.active,
  };
}

