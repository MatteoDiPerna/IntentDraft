import { z } from 'zod';

export function createSendMessageBodySchema(maxChars: number) {
  return z.object({
    content: z.string().trim().min(1).max(maxChars),
    attachments: z.array(z.string().uuid()).optional(),
  });
}
