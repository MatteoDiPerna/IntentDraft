import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { ConversationPort } from '@/adapters/types';
import type { ConversationSummaryDto, ConversationDetailDto } from '@/types/api';
import type { Conversation } from '@/types/conversation';

/** Cache runtime quando useMock=false — popolata da hooks dedicati in evoluzione. */
const cache = new Map<string, Conversation[]>();
const activeMap = new Map<string, string | null>();

function dtoToConversation(d: ConversationDetailDto | ConversationSummaryDto): Conversation {
  const detail = d as ConversationDetailDto;
  return {
    id: d.id,
    title: d.title,
    messages: detail.messages ?? [],
    phase: detail.phase ?? 'idle',
    interpretation: null,
    pendingQuestions: [],
    clarificationTurns: 0,
    promptText: detail.latestPrompt?.bodyMarkdown ?? '',
    files: (detail.files ?? []).map((f) => ({
      id: f.id,
      messageId: '',
      name: f.originalName,
      size: f.sizeBytes,
      mimeType: f.mimeType,
    })),
    updatedAt: d.updatedAt,
    pinned: Boolean(d.metadata?.pinned),
    inProject: Boolean(d.metadata?.inProject),
  };
}

export const apiConversationAdapter: ConversationPort = {
  list(userId) {
    return cache.get(userId) ?? [];
  },
  create(userId) {
    void request<{ conversation: ConversationSummaryDto }>('POST', API.conversations.list, {
      body: {},
    }).then((res) => {
      const conv = dtoToConversation(res.conversation);
      const list = cache.get(userId) ?? [];
      cache.set(userId, [conv, ...list]);
      activeMap.set(userId, conv.id);
    });
    return '';
  },
  setActive(userId, conversationId) {
    activeMap.set(userId, conversationId);
  },
  getActive(userId) {
    const id = activeMap.get(userId);
    if (!id) return null;
    return (cache.get(userId) ?? []).find((c) => c.id === id) ?? null;
  },
  async rename(userId, conversationId, title) {
    await request('PATCH', API.conversations.one(conversationId), { body: { title } });
    const list = cache.get(userId) ?? [];
    cache.set(
      userId,
      list.map((c) => (c.id === conversationId ? { ...c, title } : c)),
    );
  },
  async delete(userId, conversationId) {
    await request('DELETE', API.conversations.one(conversationId));
    const list = (cache.get(userId) ?? []).filter((c) => c.id !== conversationId);
    cache.set(userId, list);
    if (activeMap.get(userId) === conversationId) {
      activeMap.set(userId, list[0]?.id ?? null);
    }
  },
  async updateMetadata(userId, conversationId, metadata) {
    await request('PATCH', API.conversations.one(conversationId), { body: { metadata } });
    const list = cache.get(userId) ?? [];
    cache.set(
      userId,
      list.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              pinned: metadata.pinned ?? c.pinned,
              inProject: metadata.inProject ?? c.inProject,
            }
          : c,
      ),
    );
  },
  async togglePin(userId, conversationId) {
    const c = (cache.get(userId) ?? []).find((x) => x.id === conversationId);
    if (!c) return;
    await apiConversationAdapter.updateMetadata(userId, conversationId, { pinned: !c.pinned });
  },
  async toggleInProject(userId, conversationId) {
    const c = (cache.get(userId) ?? []).find((x) => x.id === conversationId);
    if (!c) return;
    await apiConversationAdapter.updateMetadata(userId, conversationId, {
      inProject: !c.inProject,
    });
  },
};

export async function hydrateConversationsFromApi(userId: string): Promise<void> {
  const data = await request<{ items: ConversationSummaryDto[] }>('GET', API.conversations.list);
  cache.set(userId, data.items.map(dtoToConversation));
}
