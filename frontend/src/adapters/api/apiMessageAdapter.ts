import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { MessagePort } from '@/adapters/types';
import type { SendMessageResponse } from '@/types/api';

export const apiMessageAdapter: MessagePort = {
  async send(_userId, conversationId, text, _locale, _attachmentFiles) {
    await request<SendMessageResponse>('POST', API.conversations.messages(conversationId), {
      body: { content: text },
    });
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
