import { z } from 'zod';

export const patchUserBodySchema = z
  .object({
    displayName: z.string().min(2).max(120).optional(),
    locale: z.enum(['it', 'en']).optional(),
  })
  .refine((body) => body.displayName !== undefined || body.locale !== undefined, {
    message: 'At least one field required',
  });

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});
