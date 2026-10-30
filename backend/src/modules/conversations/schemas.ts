import { z } from 'zod';

export const conversationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createConversationBodySchema = z.object({
  title: z.string().max(200).optional(),
});

export const conversationMetadataSchema = z.object({
  pinned: z.boolean().optional(),
  inProject: z.boolean().optional(),
  projectId: z.string().uuid().nullable().optional(),
});

export const patchConversationBodySchema = z
  .object({
    title: z.string().max(200).optional(),
    status: z.enum(['active', 'archived']).optional(),
    metadata: conversationMetadataSchema.optional(),
  })
  .refine((body) => body.title !== undefined || body.status !== undefined || body.metadata !== undefined, {
    message: 'At least one field required',
  });
