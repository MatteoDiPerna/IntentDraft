import { z } from 'zod';

export const metricsOverviewQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(90).optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
});

export const patchUserBodySchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'disabled']).optional(),
});

export const usageRangeQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const usageExportQuerySchema = usageRangeQuerySchema.extend({
  format: z.enum(['csv']).default('csv'),
});

export const putPromptTemplateBodySchema = z.object({
  provider: z.string().default('anthropic'),
  body: z.string().min(1),
  activate: z.boolean().optional(),
});

export const dryRunBodySchema = z.object({
  userText: z.string().min(1),
  locale: z.enum(['it', 'en']).default('it'),
});

export const putPlatformSettingsBodySchema = z.record(z.unknown());

export const putLegalBodySchema = z.object({
  page: z.enum(['limits', 'privacy', 'terms']),
  locale: z.enum(['it', 'en']),
  markdown: z.string(),
});
