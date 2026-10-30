import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (Supabase PostgreSQL connection string)'),
  SESSION_SECRET: z.string().min(32).default('dev-only-change-me-32-chars-min!!'),
  SESSION_COOKIE_NAME: z.string().default('intentdraft.sid'),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(14),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  MAX_MESSAGE_CHARS: z.coerce.number().int().positive().default(12_000),
  LLM_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  ANTHROPIC_API_KEY: z.string().default(''),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-20250514'),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  LLM_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(4096),
  RATE_LIMIT_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MESSAGES_MAX: z.coerce.number().int().positive().default(40),
  RATE_LIMIT_MESSAGES_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** @internal tests only */
export function resetEnvCache(): void {
  cached = null;
}

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`Invalid environment:\n${msg}`);
  }
  cached = parsed.data;
  if (cached.NODE_ENV === 'test') {
    cached = { ...cached, RATE_LIMIT_ENABLED: false, LLM_ENABLED: false };
  }
  return cached;
}
