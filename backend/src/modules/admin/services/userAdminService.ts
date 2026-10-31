import type { UserRole, UserStatus } from '@prisma/client';
import { AppError } from '../../../lib/errors.js';
import { prisma } from '../../../lib/db.js';
import type { Env } from '../../../config/env.js';
import { createPasswordResetToken } from '../../../services/passwordResetToken.js';
import { sendPasswordResetEmail } from '../../../services/passwordResetMailService.js';
import { writeAdminAudit } from './auditService.js';

export async function listAdminUsers(opts: {
  page: number;
  pageSize: number;
  q?: string;
}) {
  const { page, pageSize, q } = opts;
  const where =
    q && q.trim()
      ? {
          OR: [
            { email: { contains: q.trim(), mode: 'insensitive' as const } },
            { displayName: { contains: q.trim(), mode: 'insensitive' as const } },
          ],
        }
      : {};

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        sessions: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
  ]);

  return {
    items: rows.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName ?? '',
      authProvider: u.authProvider,
      role: u.role,
      locale: u.locale,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      lastSessionAt: u.sessions[0]?.createdAt.toISOString() ?? null,
    })),
    page,
    pageSize,
    total,
  };
}

export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [conversations, messages, files, usage] = await Promise.all([
    prisma.conversation.count({ where: { userId } }),
    prisma.message.count({ where: { conversation: { userId } } }),
    prisma.uploadedFile.count({ where: { userId } }),
    prisma.llmUsageEvent.aggregate({
      where: { userId, createdAt: { gte: since30 } },
      _sum: { inputTokens: true, outputTokens: true },
      _count: true,
    }),
  ]);

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName ?? '',
    authProvider: user.authProvider,
    role: user.role,
    locale: user.locale,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    stats: {
      conversations,
      messages,
      files,
      llmCallsLast30Days: usage._count,
      inputTokensLast30Days: usage._sum.inputTokens ?? 0,
      outputTokensLast30Days: usage._sum.outputTokens ?? 0,
    },
  };
}

async function assertNotLastAdmin(userId: string, nextRole: UserRole): Promise<void> {
  if (nextRole === 'admin') return;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'admin') return;
  const adminCount = await prisma.user.count({ where: { role: 'admin', status: 'active' } });
  if (adminCount <= 1) {
    throw new AppError(409, 'LAST_ADMIN', 'Cannot remove the last active admin');
  }
}

export async function patchAdminUser(
  adminId: string,
  userId: string,
  patch: { role?: UserRole; status?: UserStatus },
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  if (patch.role) await assertNotLastAdmin(userId, patch.role);

  if (patch.status === 'disabled' && userId === adminId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Cannot disable your own account');
  }

  if (patch.status === 'disabled' && user.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin', status: 'active' } });
    if (adminCount <= 1) {
      throw new AppError(409, 'LAST_ADMIN', 'Cannot disable the last active admin');
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(patch.role != null ? { role: patch.role } : {}),
      ...(patch.status != null ? { status: patch.status } : {}),
    },
  });

  if (patch.status === 'disabled') {
    await prisma.session.deleteMany({ where: { userId } });
  }

  await writeAdminAudit({
    adminUserId: adminId,
    action: patch.status === 'disabled' ? 'USER_DISABLE' : patch.role ? 'USER_ROLE_CHANGE' : 'USER_UPDATE',
    targetType: 'user',
    targetId: userId,
    metadata: { patch },
  });

  return {
    id: updated.id,
    email: updated.email,
    displayName: updated.displayName ?? '',
    authProvider: updated.authProvider,
    role: updated.role,
    locale: updated.locale,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function forcePasswordReset(adminId: string, userId: string, env: Env) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  if (!user.passwordHash) {
    throw new AppError(400, 'PASSWORD_RESET_UNAVAILABLE', 'User has no local password');
  }

  const token = createPasswordResetToken(user.email, env.SESSION_SECRET);
  const resetUrl = `${env.FRONTEND_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  const mail = await sendPasswordResetEmail(env, {
    email: user.email,
    resetUrl,
    displayName: user.displayName,
  });

  await writeAdminAudit({
    adminUserId: adminId,
    action: 'USER_FORCE_PASSWORD_RESET',
    targetType: 'user',
    targetId: userId,
  });

  return { ok: true as const, devResetUrl: mail.devResetUrl };
}
