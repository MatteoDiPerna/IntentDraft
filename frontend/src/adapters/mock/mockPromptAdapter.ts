import type { PromptPort } from '@/adapters/types';
import { useConversationStore } from '@/store/conversationStore';
import type { PromptArtifact } from '@/types/prompt';

export const mockPromptAdapter: PromptPort = {
  async getLatest(userId, conversationId) {
    const conv = useConversationStore.getState().list(userId).find((c) => c.id === conversationId);
    if (!conv?.promptText?.trim()) return null;
    const artifact: PromptArtifact = {
      version: '1',
      title: conv.title || 'Prompt',
      bodyMarkdown: conv.promptText,
      sections: [],
      decompositionIncluded: false,
    };
    return artifact;
  },
  async saveBody(userId, conversationId, bodyMarkdown) {
    useConversationStore.getState().updatePromptText(userId, conversationId, bodyMarkdown);
  },
  async submitFeedback() {
    await new Promise((r) => setTimeout(r, 200));
  },
};
