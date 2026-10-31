import type { Env } from '../../../config/env.js';
import { pingDatabase, prisma } from '../../../lib/db.js';

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function buildMetricsOverview(env: Env, days = 7) {
  const since = daysAgo(days);
  const since30 = daysAgo(30);

  const [
    totalUsers,
    newLast7Days,
    newLast30Days,
    localCount,
    googleCount,
    totalConversations,
    activeConversations,
    messagesLast7Days,
    convWithUserMsg,
    convWithPrompt,
    usageAgg,
    dbOk,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.user.count({ where: { createdAt: { gte: since30 } } }),
    prisma.user.count({ where: { authProvider: 'local' } }),
    prisma.user.count({ where: { authProvider: 'google' } }),
    prisma.conversation.count(),
    prisma.conversation.count({ where: { status: 'active' } }),
    prisma.message.count({ where: { createdAt: { gte: since } } }),
    prisma.conversation.count({
      where: { messages: { some: { role: 'user' } } },
    }),
    prisma.conversation.count({
      where: { promptArtifacts: { some: {} } },
    }),
    prisma.llmUsageEvent.aggregate({
      where: { createdAt: { gte: since } },
      _count: true,
      _sum: { inputTokens: true, outputTokens: true, usdEstimate: true },
    }),
    pingDatabase(),
  ]);

  const promptReadyRate =
    convWithUserMsg > 0 ? convWithPrompt / convWithUserMsg : 0;

  const usdSum = usageAgg._sum.usdEstimate;
  const estimatedUsd =
    usdSum != null ? Number(usdSum.toString()) : 0;

  return {
    users: {
      total: totalUsers,
      newLast7Days,
      newLast30Days,
      byAuthProvider: { local: localCount, google: googleCount },
    },
    conversations: {
      total: totalConversations,
      active: activeConversations,
      messagesLast7Days,
      promptReadyRate: Math.round(promptReadyRate * 1000) / 1000,
    },
    system: {
      healthOk: true,
      dbOk,
      llmEnabled: env.LLM_ENABLED,
    },
    llm: {
      callsLast7Days: usageAgg._count,
      inputTokensLast7Days: usageAgg._sum.inputTokens ?? 0,
      outputTokensLast7Days: usageAgg._sum.outputTokens ?? 0,
      estimatedUsdLast7Days: estimatedUsd,
    },
  };
}
