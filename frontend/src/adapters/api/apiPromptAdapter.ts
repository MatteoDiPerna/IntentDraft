import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { PromptPort } from '@/adapters/types';
import type { PromptArtifact } from '@/types/prompt';
import { useConversationStore } from '@/store/conversationStore';

export const apiPromptAdapter: PromptPort = {
  async getLatest(_userId, conversationId) {
    try {
      return await request<PromptArtifact>('GET', API.conversations.promptsLatest(conversationId));
    } catch {
      return null;
    }
  },
  async saveBody(userId, conversationId, bodyMarkdown) {
    useConversationStore.getState().updatePromptText(userId, conversationId, bodyMarkdown);
    const latest = await apiPromptAdapter.getLatest(userId, conversationId);
    if (!latest?.id) return;
    await request<PromptArtifact>('PUT', API.prompts.one(latest.id), {
      body: { bodyMarkdown },
    });
  },
  async submitFeedback(userId, conversationId, useful) {
    const latest = await apiPromptAdapter.getLatest(userId, conversationId);
    if (!latest?.id) return;
    await request('POST', API.prompts.feedback(latest.id), { body: { useful } });
  },
};
