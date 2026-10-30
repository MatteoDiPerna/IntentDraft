import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { MessagePort } from '@/adapters/types';
import type { SendMessageResponse } from '@/types/api';
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

export const apiMessageAdapter: MessagePort = {
  async send(userId, conversationId, text, _locale, attachmentFiles = []) {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const fileErr = validateFiles(attachmentFiles);
    if (fileErr) return fileErr;
    if (attachmentFiles.length > 0) {
      return 'type';
    }

    await request<SendMessageResponse>('POST', API.conversations.messages(conversationId), {
      body: { content: trimmed },
    });
    await loadConversationDetailFromApi(userId, conversationId);
    return null;
  },
  async editUserMessage() {
    throw new Error('NOT_IMPLEMENTED');
  },
  async skipClarification(_userId, conversationId) {
    await request('POST', API.conversations.skipClarification(conversationId));
  },
  async regeneratePrompt(_userId, conversationId) {
    await request('POST', API.conversations.regenerate(conversationId), { body: {} });
  },
};
