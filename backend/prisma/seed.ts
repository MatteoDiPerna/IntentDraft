import 'dotenv/config';
import { loadEnv } from '../src/config/env.js';
import { ensureDevAdminUser } from '../src/services/devAdminSeed.js';
import { ensureDevStandardUser } from '../src/services/devStandardUserSeed.js';
import { prisma } from '../src/lib/db.js';

async function main() {
  const env = loadEnv();
  await ensureDevAdminUser(env);
  await ensureDevStandardUser(env);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
