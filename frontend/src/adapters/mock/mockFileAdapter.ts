import type { FilePort } from '@/adapters/types';
import { useConversationStore } from '@/store/conversationStore';

export const mockFileAdapter: FilePort = {
  async addFiles(userId, conversationId, messageId, files, onProgress) {
    onProgress?.(10);
    await new Promise((r) => setTimeout(r, 120));
    onProgress?.(70);
    const err = useConversationStore.getState().addFiles(userId, conversationId, messageId, files);
    onProgress?.(100);
    return err as 'size' | 'type' | 'missing' | null;
  },
  async removeFile(userId, conversationId, fileId) {
    useConversationStore.getState().removeFile(userId, conversationId, fileId);
  },
};
