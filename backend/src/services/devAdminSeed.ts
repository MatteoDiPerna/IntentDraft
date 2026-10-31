import type { Env } from '../config/env.js';
import { prisma } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { hashPassword } from './passwordService.js';

const DEFAULT_DEV_ADMIN_EMAIL = 'admin@intentdraft.local';
const DEFAULT_DEV_ADMIN_PASSWORD = 'IntentDraft-Dev-Admin!';

/** Ensures a local-password admin exists in development (never in production). */
export async function ensureDevAdminUser(env: Env): Promise<void> {
  if (env.NODE_ENV !== 'development') return;

  const enabled = process.env.DEV_ADMIN_ENABLED !== 'false';
  if (!enabled) return;

  const email = (process.env.DEV_ADMIN_EMAIL?.trim() || DEFAULT_DEV_ADMIN_EMAIL).toLowerCase();
  const plainPassword = process.env.DEV_ADMIN_PASSWORD?.trim() || DEFAULT_DEV_ADMIN_PASSWORD;
  const displayName = process.env.DEV_ADMIN_DISPLAY_NAME?.trim() || 'Admin (dev)';

  const passwordHash = await hashPassword(plainPassword);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      displayName,
      authProvider: 'local',
      role: 'admin',
    },
    update: {
      passwordHash,
      displayName,
      authProvider: 'local',
      role: 'admin',
    },
  });

  logger.info('Dev admin account ready', { email });
}
