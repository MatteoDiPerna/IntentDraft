import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { FilePort } from '@/adapters/types';
import type { UploadedFileDto } from '@/types/api';
import { loadConversationDetailFromApi } from '@/adapters/api/apiConversationAdapter';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = [
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function validateFiles(files: File[]): 'size' | 'type' | null {
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) return 'size';
    if (!ALLOWED_MIME.includes(f.type)) return 'type';
  }
  return null;
}

export const apiFileAdapter: FilePort = {
  async addFiles(userId, conversationId, messageId, files, onProgress) {
    const err = validateFiles(files);
    if (err) return err;

    for (let i = 0; i < files.length; i += 1) {
      const f = files[i];
      const form = new FormData();
      form.append('file', f);
      if (messageId) form.append('messageId', messageId);
      onProgress?.(Math.round(((i + 0.5) / files.length) * 100));
      await request<{ file: UploadedFileDto }>('POST', API.conversations.files(conversationId), {
        formData: form,
      });
      onProgress?.(Math.round(((i + 1) / files.length) * 100));
    }

    await loadConversationDetailFromApi(userId, conversationId);
    return null;
  },
  async removeFile(userId, conversationId, fileId) {
    await request('DELETE', API.files.one(fileId));
    await loadConversationDetailFromApi(userId, conversationId);
  },
};
