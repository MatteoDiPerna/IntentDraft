import type { Env } from '../config/env.js';
import { logger } from '../lib/logger.js';

export type PasswordResetMailResult = {
  /** Solo in development — link mostrato in UI al posto dell’email */
  devResetUrl?: string;
};

/**
 * Invia (o simula) l’email di reset password.
 * Produzione: log strutturato fino a integrazione SMTP/transactional (vedi .env.example).
 */
export async function sendPasswordResetEmail(
  env: Env,
  params: { email: string; resetUrl: string; displayName?: string | null },
): Promise<PasswordResetMailResult> {
  const { email, resetUrl, displayName } = params;
  const name = displayName?.trim() || email;

  // Placeholder per provider email (Resend, SendGrid, SMTP): nessuna dipendenza obbligatoria in beta.
  logger.info('Password reset email dispatch', {
    to: email,
    subject: 'IntentDraft — reimposta password',
    resetUrl: env.NODE_ENV === 'development' ? resetUrl : '[redacted]',
    recipientName: name,
  });

  if (env.NODE_ENV === 'development') {
    return { devResetUrl: resetUrl };
  }

  return {};
}
