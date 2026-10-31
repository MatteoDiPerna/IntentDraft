import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from '../../src/lib/db.js';
import { writeAdminAudit } from '../../src/modules/admin/services/auditService.js';

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('auditService', () => {
  const email = `audit-${Date.now()}@test.intentdraft.local`;

  afterAll(async () => {
    await prisma.adminAuditLog.deleteMany({ where: { adminUser: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('inserts admin audit row', async () => {
    const user = await prisma.user.create({
      data: {
        email,
        displayName: 'Audit',
        authProvider: 'local',
        role: 'admin',
      },
    });

    await writeAdminAudit({
      adminUserId: user.id,
      action: 'TEST_ACTION',
      targetType: 'user',
      targetId: user.id,
      metadata: { ok: true },
    });

    const row = await prisma.adminAuditLog.findFirst({
      where: { adminUserId: user.id, action: 'TEST_ACTION' },
    });
    expect(row).not.toBeNull();
  });
});
