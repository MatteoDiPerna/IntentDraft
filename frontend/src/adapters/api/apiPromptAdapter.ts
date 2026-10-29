import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { PromptPort } from '@/adapters/types';
import type { PromptArtifact } from '@/types/prompt';

export const apiPromptAdapter: PromptPort = {
  async getLatest(_userId, conversationId) {
    try {
      return await request<PromptArtifact>('GET', API.conversations.promptsLatest(conversationId));
    } catch {
      return null;
    }
  },
  async saveBody(_userId, _conversationId, bodyMarkdown) {
    // Requires prompt id from latest — simplified until BE wired in UI
    void bodyMarkdown;
  },
  async submitFeedback(_userId, _conversationId, useful) {
    try {
      await request('POST', API.prompts.feedback('latest'), { body: { useful } });
    } catch {
      /* optional endpoint */
    }
  },
};
