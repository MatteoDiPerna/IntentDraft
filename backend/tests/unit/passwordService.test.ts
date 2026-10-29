import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/services/passwordService.js';

describe('passwordService', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('secret123');
    expect(hash).not.toBe('secret123');
    await expect(verifyPassword('secret123', hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
  });

  it('returns false when hash missing', async () => {
    await expect(verifyPassword('x', null)).resolves.toBe(false);
  });
});
