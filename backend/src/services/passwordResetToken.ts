import { createHmac, timingSafeEqual } from 'node:crypto';

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Signed reset token: base64url(email|exp|sig). Valid for 1 hour by default. */
export function createPasswordResetToken(
  email: string,
  secret: string,
  ttlMs = 3_600_000,
): string {
  const exp = String(Date.now() + ttlMs);
  const normalized = email.trim().toLowerCase();
  const payload = `${normalized}|${exp}`;
  const token = `${payload}|${sign(payload, secret)}`;
  return Buffer.from(token, 'utf8').toString('base64url');
}

export function verifyPasswordResetToken(token: string, secret: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split('|');
    if (parts.length !== 3) return null;
    const [email, expStr, sig] = parts;
    const payload = `${email}|${expStr}`;
    const expected = sign(payload, secret);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return null;
    return email;
  } catch {
    return null;
  }
}
