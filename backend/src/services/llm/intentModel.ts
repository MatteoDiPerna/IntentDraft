import { z } from 'zod';

export const clarificationQuestionSchema = z.object({
  id: z.string(),
  userFacingText: z.string(),
  resolvesGap: z.string().optional(),
  impact: z.enum(['critical', 'moderate']).optional(),
  optionalSkip: z.boolean().optional(),
});

export const intentModelSchema = z.object({
  version: z.string().optional(),
  language: z.string().optional(),
  taskSummary: z.string().optional(),
  objective: z.string(),
  audience: z.string().optional(),
  context: z.string().optional(),
  assumptions: z
    .array(
      z.object({
        field: z.string(),
        text: z.string(),
        reason: z.string().optional(),
      }),
    )
    .default([]),
  complexity: z.enum(['low', 'medium', 'high']).default('medium'),
  clarificationPlan: z
    .object({
      shouldAsk: z.boolean().default(false),
      questions: z.array(clarificationQuestionSchema).default([]),
      maxTurnsRemaining: z.number().optional(),
    })
    .default({ shouldAsk: false, questions: [] }),
  safety: z
    .object({
      outOfScope: z.boolean().default(false),
      refusalReason: z.string().optional(),
    })
    .default({ outOfScope: false }),
  decomposition: z
    .array(
      z.object({
        order: z.number(),
        title: z.string(),
        instruction: z.string(),
      }),
    )
    .optional(),
});

export type IntentModel = z.infer<typeof intentModelSchema>;

export const promptArtifactSchema = z.object({
  title: z.string().optional(),
  bodyMarkdown: z.string(),
  sections: z
    .array(
      z.object({
        heading: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
  warnings: z.array(z.string()).optional(),
});

export type PromptArtifactModel = z.infer<typeof promptArtifactSchema>;
