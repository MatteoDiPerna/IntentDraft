-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "CookieConsentChoice" AS ENUM ('accepted', 'rejected');

-- AlterTable
ALTER TABLE "idt_user" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "idt_usag" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "conversation_id" UUID,
    "phase" VARCHAR(32) NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "model" VARCHAR(127) NOT NULL,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "usd_estimate" DECIMAL(10,6),
    "latency_ms" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idt_usag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idt_adlg" (
    "id" UUID NOT NULL,
    "admin_user_id" UUID NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "target_type" VARCHAR(32) NOT NULL,
    "target_id" VARCHAR(255),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idt_adlg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idt_ptpl" (
    "id" UUID NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "body" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "idt_ptpl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idt_conf" (
    "key" VARCHAR(64) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "idt_conf_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "idt_cook" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "choice" "CookieConsentChoice" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idt_cook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idt_usag_user_id_created_at_idx" ON "idt_usag"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idt_usag_created_at_idx" ON "idt_usag"("created_at");

-- CreateIndex
CREATE INDEX "idt_adlg_admin_user_id_created_at_idx" ON "idt_adlg"("admin_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idt_ptpl_key_provider_active_idx" ON "idt_ptpl"("key", "provider", "active");

-- CreateIndex
CREATE UNIQUE INDEX "idt_ptpl_key_provider_version_key" ON "idt_ptpl"("key", "provider", "version");

-- CreateIndex
CREATE INDEX "idt_cook_created_at_idx" ON "idt_cook"("created_at");

-- AddForeignKey
ALTER TABLE "idt_usag" ADD CONSTRAINT "idt_usag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "idt_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_adlg" ADD CONSTRAINT "idt_adlg_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "idt_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_ptpl" ADD CONSTRAINT "idt_ptpl_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "idt_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_cook" ADD CONSTRAINT "idt_cook_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "idt_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
