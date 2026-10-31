/** Dev/mock password reset tokens (browser only — not for production). */
export function createMockResetToken(email: string, ttlMs = 3_600_000): string {
  const payload = { email: email.trim().toLowerCase(), exp: Date.now() + ttlMs };
  return btoa(JSON.stringify(payload));
}

export function parseMockResetToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token)) as { email?: string; exp?: number };
    if (!payload.email || !payload.exp || Date.now() > payload.exp) return null;
    return payload.email;
  } catch {
    return null;
  }
}
