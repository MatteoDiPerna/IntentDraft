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
    if (metadata.pinned !== undefined && metadata.pinned !== s().list(userId).find((x) => x.id === conversationId)?.pinned) {
      s().togglePin(userId, conversationId);
    }
    if (metadata.projectId !== undefined || metadata.inProject !== undefined) {
      const projectId =
        metadata.projectId ??
        (metadata.inProject === false ? null : metadata.inProject ? 'default' : undefined);
      if (projectId !== undefined) {
        s().moveToProject(userId, conversationId, projectId);
      }
    }
  },
  async togglePin(userId, conversationId) {
    s().togglePin(userId, conversationId);
  },
  async moveToProject(userId, conversationId, projectId) {
    s().moveToProject(userId, conversationId, projectId);
  },
};
