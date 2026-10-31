import type { Env } from '../../../config/env.js';
import { AppError } from '../../../lib/errors.js';
import { prisma } from '../../../lib/db.js';
import { writeAdminAudit } from './auditService.js';

export const PLATFORM_CONFIG_ALLOWLIST = ['features.maintenanceMode'] as const;

export type PlatformConfigKey = (typeof PLATFORM_CONFIG_ALLOWLIST)[number];

export async function getPlatformSettings(env: Env) {
  const overrides = await prisma.platformConfig.findMany({
    where: { key: { in: [...PLATFORM_CONFIG_ALLOWLIST] } },
  });
  const overrideMap: Record<string, unknown> = {};
  for (const row of overrides) {
    overrideMap[row.key] = row.value;
  }

  return {
    envReadOnly: {
      maxUploadBytes: env.MAX_UPLOAD_BYTES,
      maxMessageChars: env.MAX_MESSAGE_CHARS,
      rateLimitMessagesMax: env.RATE_LIMIT_MESSAGES_MAX,
      rateLimitAuthMax: env.RATE_LIMIT_AUTH_MAX,
      llmEnabled: env.LLM_ENABLED,
      anthropicModel: env.ANTHROPIC_MODEL,
    },
    overrides: overrideMap,
  };
}

export async function putPlatformSettings(
  adminId: string,
  body: Record<string, unknown>,
) {
  const keys = Object.keys(body);
  for (const key of keys) {
    if (!(PLATFORM_CONFIG_ALLOWLIST as readonly string[]).includes(key)) {
      throw new AppError(400, 'VALIDATION_ERROR', `Config key not allowed: ${key}`);
    }
  }

  for (const key of keys) {
    await prisma.platformConfig.upsert({
      where: { key },
      create: { key, value: body[key] as object, updatedBy: adminId },
      update: { value: body[key] as object, updatedBy: adminId },
    });
  }

  await writeAdminAudit({
    adminUserId: adminId,
    action: 'PLATFORM_CONFIG_UPDATE',
    targetType: 'config',
    metadata: { keys },
  });

  return { ok: true as const };
}
