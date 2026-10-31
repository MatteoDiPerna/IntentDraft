import { prisma } from '../../../lib/db.js';

export type AdminAuditInput = {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function writeAdminAudit(input: AdminAuditInput): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      adminUserId: input.adminUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}
