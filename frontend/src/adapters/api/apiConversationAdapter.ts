import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { ConversationPort } from '@/adapters/types';
import type { ConversationSummaryDto, ConversationDetailDto } from '@/types/api';
import type { Conversation } from '@/types/conversation';
import { useConversationStore } from '@/store/conversationStore';

function store() {
  return useConversationStore.getState();
}

function isBlankRecentChat(c: Conversation): boolean {
  return !c.pinned && !c.inProject && c.messages.length === 0;
}

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
    return store().list(userId);
  },
  async create(userId) {
    const list = store().list(userId);
    const existingBlank = list.find(isBlankRecentChat);
    if (existingBlank) {
      store().setActive(userId, existingBlank.id);
      return existingBlank.id;
    }

    const res = await request<{ conversation: ConversationSummaryDto }>('POST', API.conversations.list, {
      body: {},
    });
    const conv = dtoToConversation(res.conversation);
    const current = store().byUser[userId] ?? [];
    useConversationStore.setState({
      byUser: { ...store().byUser, [userId]: [conv, ...current] },
      activeId: { ...store().activeId, [userId]: conv.id },
    });
    return conv.id;
  },
  setActive(userId, conversationId) {
    store().setActive(userId, conversationId);
  },
  getActive(userId) {
    return store().getActive(userId);
  },
  async rename(userId, conversationId, title) {
    await request('PATCH', API.conversations.one(conversationId), { body: { title } });
    store().renameConversation(userId, conversationId, title);
  },
  async delete(userId, conversationId) {
    await request('DELETE', API.conversations.one(conversationId));
    store().deleteConversation(userId, conversationId);
  },
  async updateMetadata(userId, conversationId, metadata) {
    await request('PATCH', API.conversations.one(conversationId), { body: { metadata } });
    const list = store().list(userId);
    const c = list.find((x) => x.id === conversationId);
    if (!c) return;
    if (metadata.pinned !== undefined && Boolean(c.pinned) !== metadata.pinned) {
      store().togglePin(userId, conversationId);
    }
    if (metadata.inProject !== undefined && Boolean(c.inProject) !== metadata.inProject) {
      store().toggleInProject(userId, conversationId);
    }
  },
  async togglePin(userId, conversationId) {
    const c = store().list(userId).find((x) => x.id === conversationId);
    if (!c) return;
    await apiConversationAdapter.updateMetadata(userId, conversationId, { pinned: !c.pinned });
  },
  async toggleInProject(userId, conversationId) {
    const c = store().list(userId).find((x) => x.id === conversationId);
    if (!c) return;
    await apiConversationAdapter.updateMetadata(userId, conversationId, {
      inProject: !c.inProject,
    });
  },
};

export function applyConversationDetailToStore(userId: string, detail: ConversationDetailDto): void {
  const conv = dtoToConversation(detail);
  const state = store();
  const list = state.byUser[userId] ?? [];
  const idx = list.findIndex((c) => c.id === conv.id);
  const nextList =
    idx >= 0 ? list.map((c) => (c.id === conv.id ? conv : c)) : [conv, ...list];
  nextList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  useConversationStore.setState({
    byUser: { ...state.byUser, [userId]: nextList },
    activeId: { ...state.activeId, [userId]: conv.id },
  });
}

export async function loadConversationDetailFromApi(
  userId: string,
  conversationId: string,
): Promise<void> {
  const detail = await request<ConversationDetailDto>('GET', API.conversations.one(conversationId));
  applyConversationDetailToStore(userId, detail);
}

export async function hydrateConversationsFromApi(userId: string): Promise<void> {
  const data = await request<{ items: ConversationSummaryDto[] }>('GET', API.conversations.list);
  const conversations = data.items.map(dtoToConversation);
  const state = store();
  const prevActive = state.activeId[userId];
  const activeStillExists = prevActive && conversations.some((c) => c.id === prevActive);
  const activeId = activeStillExists ? prevActive : (conversations[0]?.id ?? null);
  useConversationStore.setState({
    byUser: { ...state.byUser, [userId]: conversations },
    activeId: {
      ...state.activeId,
      [userId]: activeId,
    },
  });
  if (activeId) {
    await loadConversationDetailFromApi(userId, activeId);
  }
}
