/**
 * Facade conversazioni — invalidazione via Zustand (alternativa leggera a TanStack Query in fase mock).
 * Con API attiva, estendere qui hydrate + refetch da server.
 */
import { useCallback } from 'react';
import { useConversationStore } from '@/store/conversationStore';
import { appConfig } from '@/config';
import { hydrateConversationsFromApi } from '@/adapters/api/apiConversationAdapter';

export function useConversationList(userId: string) {
  return useConversationStore((s) => (userId ? s.list(userId) : []));
}

export function useActiveConversation(userId: string) {
  return useConversationStore((s) => (userId ? s.getActive(userId) : null));
}

export function useConversationMutations(userId: string) {
  const createConversation = useConversationStore((s) => s.createConversation);
  const setActive = useConversationStore((s) => s.setActive);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);
  const renameConversation = useConversationStore((s) => s.renameConversation);
  const togglePin = useConversationStore((s) => s.togglePin);
  const moveToProject = useConversationStore((s) => s.moveToProject);

  const refreshFromApi = useCallback(async () => {
    if (appConfig.useMock || !userId) return;
    await hydrateConversationsFromApi(userId);
  }, [userId]);

  return {
    createConversation: useCallback(() => createConversation(userId), [createConversation, userId]),
    setActive: useCallback((id: string) => setActive(userId, id), [setActive, userId]),
    deleteConversation: useCallback(
      (id: string) => deleteConversation(userId, id),
      [deleteConversation, userId],
    ),
    renameConversation: useCallback(
      (id: string, title: string) => renameConversation(userId, id, title),
      [renameConversation, userId],
    ),
    togglePin: useCallback((id: string) => togglePin(userId, id), [togglePin, userId]),
    moveToProject: useCallback(
      (id: string, projectId: string | null) => moveToProject(userId, id, projectId),
      [moveToProject, userId],
    ),
    refreshFromApi,
  };
}
