import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  checkHealth,
  isRecoverableApiError,
  request,
  setUnauthorizedHandler,
} from '@/api/client';

vi.mock('@/config', () => ({
  appConfig: { apiUrl: 'http://test-api.local', useMock: false },
}));

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...Object.fromEntries(new Headers(init?.headers)) },
  });
}

describe('ApiError', () => {
  it('marks network and rate-limit errors as retryable', () => {
    expect(new ApiError(0, 'NETWORK_ERROR', 'x').retryable).toBe(true);
    expect(new ApiError(503, 'INTERNAL_ERROR', 'x').retryable).toBe(true);
    expect(new ApiError(429, 'RATE_LIMITED', 'x').retryable).toBe(true);
    expect(new ApiError(400, 'VALIDATION_ERROR', 'x').retryable).toBe(false);
  });

  it('isRecoverableApiError respects retryable', () => {
    expect(isRecoverableApiError(new ApiError(0, 'NETWORK_ERROR', 'x'))).toBe(true);
    expect(isRecoverableApiError(new Error('other'))).toBe(false);
  });
});

describe('request', () => {
  beforeEach(() => {
    setUnauthorizedHandler(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('GET returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ ok: true, id: '1' })),
    );
    const data = await request<{ ok: boolean; id: string }>('GET', '/api/health');
    expect(data).toEqual({ ok: true, id: '1' });
    expect(fetch).toHaveBeenCalledWith(
      'http://test-api.local/api/health',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('POST sends JSON body and Content-Type', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: true })));
    await request('POST', '/api/auth/login', { body: { email: 'a@b.c', password: 'secret' } });
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ email: 'a@b.c', password: 'secret' }));
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('parses API error envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          { error: { code: 'VALIDATION_ERROR', message: 'Invalid email', details: { field: 'email' } } },
          { status: 422 },
        ),
      ),
    );
    await expect(request('POST', '/api/auth/register')).rejects.toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Invalid email',
      details: { field: 'email' },
    });
  });

  it('throws NETWORK_ERROR when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
    await expect(request('GET', '/api/health')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });

  it('invokes unauthorized handler on 401', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ error: { code: 'UNAUTHORIZED', message: 'nope' } }, { status: 401 }),
      ),
    );
    await expect(request('GET', '/api/auth/me')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('returns undefined for 204', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })));
    await expect(request('POST', '/api/auth/logout')).resolves.toBeUndefined();
  });
});

describe('checkHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when health payload ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ ok: true })));
    await expect(checkHealth()).resolves.toBe(true);
  });

  it('returns false on failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('down'))));
    await expect(checkHealth()).resolves.toBe(false);
  });
});
