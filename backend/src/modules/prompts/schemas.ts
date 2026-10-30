import { z } from 'zod';

export const promptIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const putPromptBodySchema = z.object({
  bodyMarkdown: z.string().min(1),
});

export const promptFeedbackBodySchema = z.object({
  useful: z.boolean(),
});
