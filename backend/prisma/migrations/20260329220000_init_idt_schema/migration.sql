-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('it', 'en');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'google');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant', 'system');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('pending', 'ok', 'rejected');

-- CreateEnum
CREATE TYPE "PromptFeedback" AS ENUM ('useful', 'not_useful');

-- CreateTable
CREATE TABLE "idt_user" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "display_name" VARCHAR(120),
    "locale" "Locale" NOT NULL DEFAULT 'it',
    "auth_provider" "AuthProvider" NOT NULL DEFAULT 'local',
    "google_sub" VARCHAR(255),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "idt_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idt_sess" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idt_sess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idt_conv" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL DEFAULT '',
    "status" "ConversationStatus" NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "ai_state" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "idt_conv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idt_msgs" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idt_msgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idt_file" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "conversation_id" UUID,
    "message_id" UUID,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(127) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "storage_path" VARCHAR(512) NOT NULL,
    "scan_status" "ScanStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idt_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idt_prmt" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "message_id" UUID,
    "body_markdown" TEXT NOT NULL,
    "sections" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "feedback" "PromptFeedback",
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idt_prmt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idt_user_email_key" ON "idt_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "idt_user_google_sub_key" ON "idt_user"("google_sub");

-- CreateIndex
CREATE INDEX "idt_sess_user_id_idx" ON "idt_sess"("user_id");

-- CreateIndex
CREATE INDEX "idt_sess_expires_at_idx" ON "idt_sess"("expires_at");

-- CreateIndex
CREATE INDEX "idt_conv_user_id_updated_at_idx" ON "idt_conv"("user_id", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "idt_msgs_conversation_id_created_at_idx" ON "idt_msgs"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "idt_file_conversation_id_idx" ON "idt_file"("conversation_id");

-- CreateIndex
CREATE INDEX "idt_file_user_id_idx" ON "idt_file"("user_id");

-- CreateIndex
CREATE INDEX "idt_prmt_conversation_id_created_at_idx" ON "idt_prmt"("conversation_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "idt_sess" ADD CONSTRAINT "idt_sess_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "idt_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_conv" ADD CONSTRAINT "idt_conv_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "idt_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_msgs" ADD CONSTRAINT "idt_msgs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "idt_conv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_file" ADD CONSTRAINT "idt_file_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "idt_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_file" ADD CONSTRAINT "idt_file_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "idt_conv"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_file" ADD CONSTRAINT "idt_file_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "idt_msgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_prmt" ADD CONSTRAINT "idt_prmt_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "idt_conv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idt_prmt" ADD CONSTRAINT "idt_prmt_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "idt_msgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
