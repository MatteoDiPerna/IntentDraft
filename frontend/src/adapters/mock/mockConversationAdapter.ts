import type { ConversationPort } from '@/adapters/types';
import { useConversationStore } from '@/store/conversationStore';

function s() {
  return useConversationStore.getState();
}

export const mockConversationAdapter: ConversationPort = {
  list(userId) {
    return s().list(userId);
  },
  async create(userId) {
    return s().createConversation(userId);
  },
  setActive(userId, conversationId) {
    s().setActive(userId, conversationId);
  },
  getActive(userId) {
    return s().getActive(userId);
  },
  async rename(userId, conversationId, title) {
    s().renameConversation(userId, conversationId, title);
  },
  async delete(userId, conversationId) {
    s().deleteConversation(userId, conversationId);
  },
  async updateMetadata(userId, conversationId, metadata) {
    if (metadata.pinned !== undefined) {
      const list = s().list(userId);
      const c = list.find((x) => x.id === conversationId);
      if (c && Boolean(c.pinned) !== metadata.pinned) {
        s().togglePin(userId, conversationId);
      }
    }
    if (metadata.inProject !== undefined) {
      const list = s().list(userId);
      const c = list.find((x) => x.id === conversationId);
      if (c && Boolean(c.inProject) !== metadata.inProject) {
        s().toggleInProject(userId, conversationId);
      }
    }
  },
  async togglePin(userId, conversationId) {
    s().togglePin(userId, conversationId);
  },
  async toggleInProject(userId, conversationId) {
    s().toggleInProject(userId, conversationId);
  },
};
