import { appConfig } from '@/config';
import { API } from '@/api/endpoints';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | string;

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(status: number, code: ApiErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get retryable(): boolean {
    return (
      this.status === 0 ||
      this.status === 503 ||
      this.status === 429 ||
      this.code === 'RATE_LIMITED' ||
      this.code === 'NETWORK_ERROR'
    );
  }
}

export function isRecoverableApiError(err: unknown): err is ApiError {
  return err instanceof ApiError && err.retryable;
}

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

function joinUrl(path: string): string {
  const base = appConfig.apiUrl.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function request<T>(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    formData?: FormData;
    signal?: AbortSignal;
  },
): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options?.formData) {
    body = options.formData;
  } else if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(joinUrl(path), {
      method,
      credentials: 'include',
      headers,
      body,
      signal: options?.signal,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new ApiError(res.status, 'INTERNAL_ERROR', text || res.statusText);
      }
    }
  }

  if (!res.ok) {
    const err = json as { error?: { code?: string; message?: string; details?: Record<string, unknown> } };
    const code = err?.error?.code ?? 'INTERNAL_ERROR';
    const message = err?.error?.message ?? res.statusText;
    if (res.status === 401) {
      onUnauthorized?.();
    }
    throw new ApiError(res.status, code, message, err?.error?.details);
  }

  return json as T;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const data = await request<{ ok?: boolean }>('GET', API.health);
    return Boolean(data?.ok);
  } catch {
    return false;
  }
}
