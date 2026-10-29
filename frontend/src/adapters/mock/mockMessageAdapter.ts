import type { MessagePort } from '@/adapters/types';
import { useConversationStore } from '@/store/conversationStore';

export const mockMessageAdapter: MessagePort = {
  send(userId, conversationId, text, locale, attachmentFiles) {
    return useConversationStore
      .getState()
      .sendUserMessage(userId, conversationId, text, locale, attachmentFiles);
  },
  editUserMessage(userId, conversationId, messageId, text, locale) {
    return useConversationStore
      .getState()
      .editUserMessage(userId, conversationId, messageId, text, locale);
  },
  skipClarification(userId, conversationId, locale) {
    return useConversationStore.getState().skipClarification(userId, conversationId, locale);
  },
  regeneratePrompt(userId, conversationId, locale) {
    return useConversationStore.getState().regeneratePrompt(userId, conversationId, locale);
  },
};
