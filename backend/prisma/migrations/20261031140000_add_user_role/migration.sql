-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "idt_user" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'user';
