import type { Prisma } from '@prisma/client';
import type { Env } from '../config/env.js';
import { prisma } from '../lib/db.js';
import { AppError } from '../lib/errors.js';
import type { ConversationMetadataDto } from '../types/conversationDto.js';
import { deleteConversationFiles } from './fileService.js';

export async function listConversationsForUser(userId: string) {
  const rows = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  return rows.map((row) => ({
    conversation: row,
    latestMessage: row.messages[0],
  }));
}

export async function createConversation(userId: string, title?: string) {
  return prisma.conversation.create({
    data: {
      userId,
      title: title?.trim() ?? '',
    },
  });
}

export async function getConversationOwned(userId: string, conversationId: string) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      uploadedFiles: { orderBy: { createdAt: 'asc' } },
      promptArtifacts: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
  if (!conv) {
    throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
  }
  return conv;
}

function mergeMetadata(
  existing: unknown,
  patch: ConversationMetadataDto,
): Prisma.InputJsonValue {
  const base =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  return { ...base, ...patch } as Prisma.InputJsonValue;
}

export async function patchConversation(
  userId: string,
  conversationId: string,
  input: {
    title?: string;
    status?: 'active' | 'archived';
    metadata?: ConversationMetadataDto;
  },
) {
  const existing = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
  }

  const data: Prisma.ConversationUpdateInput = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.status !== undefined) data.status = input.status;
  if (input.metadata !== undefined) {
    data.metadata = mergeMetadata(existing.metadata, input.metadata);
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data,
  });
}

export async function deleteConversation(
  userId: string,
  conversationId: string,
  env?: Env,
) {
  const existing = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
  }
  if (env) {
    await deleteConversationFiles(env, userId, conversationId);
  }
  await prisma.conversation.delete({ where: { id: conversationId } });
}
