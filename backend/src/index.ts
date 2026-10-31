import 'dotenv/config';
import { buildServer } from './app.js';
import { logger } from './lib/logger.js';
import { ensureDevAdminUser } from './services/devAdminSeed.js';
import { ensureDevStandardUser } from './services/devStandardUserSeed.js';

async function main() {
  const { app, env } = await buildServer();
  await ensureDevAdminUser(env);
  await ensureDevStandardUser(env);
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info('API listening', { port: env.PORT, corsOrigin: env.CORS_ORIGIN });
}

main().catch((err) => {
  logger.error('Failed to start', { message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
