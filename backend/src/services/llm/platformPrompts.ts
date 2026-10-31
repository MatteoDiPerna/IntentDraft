import { prisma } from '../../lib/db.js';

export async function getActivePromptBody(key: string, provider = 'anthropic'): Promise<string | null> {
  try {
    const row = await prisma.platformPromptTemplate.findFirst({
      where: { key, provider, active: true },
      orderBy: { version: 'desc' },
    });
    return row?.body ?? null;
  } catch {
    return null;
  }
}
