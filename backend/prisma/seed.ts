import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Dev seed (phase B2+): create test user here.
  await prisma.user.count();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
