import { createReadStream } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { assertAllowedMime, sanitizeOriginalName } from '../lib/filePolicy.js';

function uploadRoot(env: Env): string {
  return path.resolve(env.UPLOAD_DIR);
}

export function resolveStoredFilePath(env: Env, storagePath: string): string {
  const root = uploadRoot(env);
  const normalized = storagePath.replace(/\\/g, '/');
  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid storage path');
  }
  const full = path.resolve(root, normalized);
  if (!full.startsWith(root + path.sep) && full !== root) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid storage path');
  }
  return full;
}

function extensionFor(originalName: string, mimeType: string): string {
  const lower = originalName.toLowerCase();
  if (lower.endsWith('.pdf') || mimeType === 'application/pdf') return '.pdf';
  if (lower.endsWith('.md') || mimeType === 'text/markdown') return '.md';
  if (lower.endsWith('.txt') || mimeType === 'text/plain') return '.txt';
  if (lower.endsWith('.docx') || mimeType.includes('wordprocessingml')) return '.docx';
  return '';
}

export async function saveConversationUpload(
  env: Env,
  userId: string,
  input: { buffer: Buffer; mimeType: string; originalName: string },
): Promise<{ storagePath: string; originalName: string; mimeType: string; sizeBytes: number }> {
  assertAllowedMime(input.mimeType);
  const originalName = sanitizeOriginalName(input.originalName);
  const ext = extensionFor(originalName, input.mimeType);
  const storagePath = path.posix.join(userId, `${randomUUID()}${ext}`);
  const fullPath = resolveStoredFilePath(env, storagePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, input.buffer);
  return {
    storagePath,
    originalName,
    mimeType: input.mimeType,
    sizeBytes: input.buffer.length,
  };
}

export async function removeStoredFile(env: Env, storagePath: string): Promise<void> {
  try {
    const fullPath = resolveStoredFilePath(env, storagePath);
    await unlink(fullPath);
  } catch {
    /* ignore missing file on disk */
  }
}

export function createStoredFileReadStream(env: Env, storagePath: string) {
  const fullPath = resolveStoredFilePath(env, storagePath);
  return createReadStream(fullPath);
}
