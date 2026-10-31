import { prisma } from '../../../lib/db.js';

function parseDateRange(from?: string, to?: string): { from: Date; to: Date } {
  const toDate = to ? new Date(to) : new Date();
  const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: fromDate, to: toDate };
}

export async function usageByUser(userId: string, from?: string, to?: string) {
  const { from: fromDate, to: toDate } = parseDateRange(from, to);
  const events = await prisma.llmUsageEvent.findMany({
    where: { userId, createdAt: { gte: fromDate, lte: toDate } },
    orderBy: { createdAt: 'asc' },
  });

  const byDay = new Map<
    string,
    { inputTokens: number; outputTokens: number; usd: number; calls: number }
  >();
  const byPhase = new Map<string, { inputTokens: number; outputTokens: number; calls: number }>();
  const byModel = new Map<string, { inputTokens: number; outputTokens: number; calls: number }>();

  let totalInput = 0;
  let totalOutput = 0;
  let totalUsd = 0;

  for (const e of events) {
    const day = e.createdAt.toISOString().slice(0, 10);
    const dayRow = byDay.get(day) ?? { inputTokens: 0, outputTokens: 0, usd: 0, calls: 0 };
    dayRow.inputTokens += e.inputTokens;
    dayRow.outputTokens += e.outputTokens;
    dayRow.usd += e.usdEstimate ? Number(e.usdEstimate.toString()) : 0;
    dayRow.calls += 1;
    byDay.set(day, dayRow);

    const phaseRow = byPhase.get(e.phase) ?? { inputTokens: 0, outputTokens: 0, calls: 0 };
    phaseRow.inputTokens += e.inputTokens;
    phaseRow.outputTokens += e.outputTokens;
    phaseRow.calls += 1;
    byPhase.set(e.phase, phaseRow);

    const modelRow = byModel.get(e.model) ?? { inputTokens: 0, outputTokens: 0, calls: 0 };
    modelRow.inputTokens += e.inputTokens;
    modelRow.outputTokens += e.outputTokens;
    modelRow.calls += 1;
    byModel.set(e.model, modelRow);

    totalInput += e.inputTokens;
    totalOutput += e.outputTokens;
    totalUsd += e.usdEstimate ? Number(e.usdEstimate.toString()) : 0;
  }

  return {
    daily: [...byDay.entries()].map(([date, v]) => ({ date, ...v })),
    totals: { inputTokens: totalInput, outputTokens: totalOutput, estimatedUsd: totalUsd, calls: events.length },
    byPhase: [...byPhase.entries()].map(([phase, v]) => ({ phase, ...v })),
    byModel: [...byModel.entries()].map(([model, v]) => ({ model, ...v })),
  };
}

export async function exportUsageCsv(from?: string, to?: string): Promise<string> {
  const { from: fromDate, to: toDate } = parseDateRange(from, to);
  const events = await prisma.llmUsageEvent.findMany({
    where: { createdAt: { gte: fromDate, lte: toDate } },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { email: true } } },
  });

  const header = 'date,user_email,phase,model,input_tokens,output_tokens,usd_estimate';
  const lines = events.map((e) => {
    const usd = e.usdEstimate ? e.usdEstimate.toString() : '';
    return [
      e.createdAt.toISOString().slice(0, 10),
      e.user.email,
      e.phase,
      e.model,
      e.inputTokens,
      e.outputTokens,
      usd,
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(',');
  });
  return [header, ...lines].join('\n');
}
