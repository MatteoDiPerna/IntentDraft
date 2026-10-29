import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z.string().min(2).max(120),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

export type ProfileForm = z.infer<typeof profileSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
