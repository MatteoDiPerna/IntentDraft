import { prisma } from '../lib/db.js';
import { AppError } from '../lib/errors.js';
import type { Env } from '../config/env.js';
import { toFileDto } from '../modules/conversations/mappers.js';
import {
  createStoredFileReadStream,
  removeStoredFile,
  saveConversationUpload,
} from './fileStorageService.js';

export async function listConversationFiles(userId: string, conversationId: string) {
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conv) {
    throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
  }
  const files = await prisma.uploadedFile.findMany({
    where: { conversationId, userId },
    orderBy: { createdAt: 'asc' },
  });
  return files.map(toFileDto);
}

export async function uploadConversationFile(
  env: Env,
  userId: string,
  conversationId: string,
  input: { buffer: Buffer; mimeType: string; originalName: string; messageId?: string },
) {
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conv) {
    throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
  }

  if (input.messageId) {
    const message = await prisma.message.findFirst({
      where: { id: input.messageId, conversationId },
    });
    if (!message) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid messageId for this conversation');
    }
  }

  if (input.buffer.length > env.MAX_UPLOAD_BYTES) {
    throw new AppError(400, 'VALIDATION_ERROR', 'File too large', {
      maxBytes: env.MAX_UPLOAD_BYTES,
    });
  }

  let stored;
  try {
    stored = await saveConversationUpload(env, userId, input);
  } catch (err) {
    if (err instanceof Error && err.message === 'MIME_NOT_ALLOWED') {
      throw new AppError(400, 'VALIDATION_ERROR', 'File type not allowed');
    }
    throw err;
  }

  const row = await prisma.uploadedFile.create({
    data: {
      userId,
      conversationId,
      messageId: input.messageId ?? null,
      originalName: stored.originalName,
      mimeType: stored.mimeType,
      sizeBytes: BigInt(stored.sizeBytes),
      storagePath: stored.storagePath,
      scanStatus: 'ok',
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return toFileDto(row);
}

export async function getOwnedFile(userId: string, fileId: string) {
  const file = await prisma.uploadedFile.findFirst({ where: { id: fileId, userId } });
  if (!file) {
    throw new AppError(404, 'NOT_FOUND', 'File not found');
  }
  return file;
}

export async function deleteOwnedFile(env: Env, userId: string, fileId: string) {
  const file = await getOwnedFile(userId, fileId);
  await removeStoredFile(env, file.storagePath);
  await prisma.uploadedFile.delete({ where: { id: fileId } });
}

export function openOwnedFileStream(env: Env, userId: string, fileId: string) {
  return getOwnedFile(userId, fileId).then((file) => ({
    file,
    stream: createStoredFileReadStream(env, file.storagePath),
  }));
}

export async function deleteConversationFiles(env: Env, userId: string, conversationId: string) {
  const files = await prisma.uploadedFile.findMany({ where: { conversationId, userId } });
  for (const f of files) {
    await removeStoredFile(env, f.storagePath);
  }
  if (files.length) {
    await prisma.uploadedFile.deleteMany({ where: { conversationId, userId } });
  }
}
