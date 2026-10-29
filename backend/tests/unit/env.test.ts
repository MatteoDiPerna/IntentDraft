import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

describe('loadEnv', () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/postgres';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = { ...prev };
    vi.resetModules();
  });

  it('parses required DATABASE_URL', async () => {
    const { loadEnv, resetEnvCache } = await import('../../src/config/env.js');
    resetEnvCache();
    const env = loadEnv();
    expect(env.PORT).toBe(3001);
    expect(env.DATABASE_URL).toContain('postgresql');
  });
});
