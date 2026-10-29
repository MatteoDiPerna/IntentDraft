import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { FilePort } from '@/adapters/types';

export const apiFileAdapter: FilePort = {
  async addFiles(_userId, conversationId, _messageId, files, onProgress) {
    const form = new FormData();
    for (const f of files) form.append('files', f);
    onProgress?.(30);
    await request('POST', API.conversations.files(conversationId), { formData: form });
    onProgress?.(100);
    return null;
  },
  async removeFile(_userId, _conversationId, fileId) {
    await request('DELETE', API.files.one(fileId));
  },
};
