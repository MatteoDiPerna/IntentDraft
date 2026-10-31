import { afterAll, describe, expect, it } from 'vitest';
import { loadEnv, resetEnvCache } from '../../../src/config/env.js';
import { computeUsdEstimate } from '../../../src/modules/admin/services/usageRecorder.js';

describe('usageRecorder', () => {
  afterAll(() => {
    delete process.env.LLM_USD_PER_1M_INPUT;
    delete process.env.LLM_USD_PER_1M_OUTPUT;
    resetEnvCache();
  });

  it('T-ADMIN-05: computes USD estimate from env rates', () => {
    process.env.LLM_USD_PER_1M_INPUT = '3';
    process.env.LLM_USD_PER_1M_OUTPUT = '15';
    resetEnvCache();
    const env = loadEnv();
    const usd = computeUsdEstimate(env, 1_000_000, 1_000_000);
    expect(usd).not.toBeNull();
    expect(Number(usd!.toString())).toBeCloseTo(18, 5);
  });

  it('returns null when rates are zero', () => {
    process.env.LLM_USD_PER_1M_INPUT = '0';
    process.env.LLM_USD_PER_1M_OUTPUT = '0';
    resetEnvCache();
    const env = loadEnv();
    expect(computeUsdEstimate(env, 1000, 1000)).toBeNull();
  });
});
