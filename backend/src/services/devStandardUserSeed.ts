import type { Env } from '../config/env.js';
import { prisma } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { hashPassword } from './passwordService.js';

const DEFAULT_DEV_USER_EMAIL = 'user@intentdraft.local';
const DEFAULT_DEV_USER_PASSWORD = 'IntentDraft-Dev-User!';

/** Ensures a standard (non-admin) local user exists in development for manual RBAC tests. */
export async function ensureDevStandardUser(env: Env): Promise<void> {
  if (env.NODE_ENV !== 'development') return;

  const enabled = process.env.DEV_STANDARD_USER_ENABLED !== 'false';
  if (!enabled) return;

  const email = (process.env.DEV_STANDARD_USER_EMAIL?.trim() || DEFAULT_DEV_USER_EMAIL).toLowerCase();
  const plainPassword =
    process.env.DEV_STANDARD_USER_PASSWORD?.trim() || DEFAULT_DEV_USER_PASSWORD;
  const displayName = process.env.DEV_STANDARD_USER_DISPLAY_NAME?.trim() || 'User (dev)';

  const passwordHash = await hashPassword(plainPassword);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      displayName,
      authProvider: 'local',
      role: 'user',
    },
    update: {
      passwordHash,
      displayName,
      authProvider: 'local',
      role: 'user',
    },
  });

  logger.info('Dev standard user account ready', { email });
}
