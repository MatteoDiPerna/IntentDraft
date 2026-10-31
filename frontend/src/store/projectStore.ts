import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createId } from '@/lib/ids';
import { STORAGE } from '@/lib/storageKeys';

export const DEFAULT_PROJECT_ID = 'default';

export interface ProjectFolder {
  id: string;
  name: string;
  createdAt: string;
}

interface ProjectState {
  byUser: Record<string, ProjectFolder[]>;
  ensureDefaults: (userId: string, defaultName: string) => void;
  list: (userId: string) => ProjectFolder[];
  create: (userId: string, name: string) => ProjectFolder;
  rename: (userId: string, projectId: string, name: string) => void;
  remove: (userId: string, projectId: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      byUser: {},
      ensureDefaults(userId, defaultName) {
        const current = get().byUser[userId];
        if (current?.length) return;
        set({
          byUser: {
            ...get().byUser,
            [userId]: [
              {
                id: DEFAULT_PROJECT_ID,
                name: defaultName,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        });
      },
      list(userId) {
        return get().byUser[userId] ?? [];
      },
      create(userId, name) {
        const trimmed = name.trim();
        const folder: ProjectFolder = {
          id: createId(),
          name: trimmed || 'Project',
          createdAt: new Date().toISOString(),
        };
        const list = get().byUser[userId] ?? [];
        set({
          byUser: { ...get().byUser, [userId]: [...list, folder] },
        });
        return folder;
      },
      rename(userId, projectId, name) {
        const trimmed = name.trim();
        if (!trimmed) return;
        const list = get().byUser[userId] ?? [];
        set({
          byUser: {
            ...get().byUser,
            [userId]: list.map((p) => (p.id === projectId ? { ...p, name: trimmed } : p)),
          },
        });
      },
      remove(userId, projectId) {
        if (projectId === DEFAULT_PROJECT_ID) return;
        const list = get().byUser[userId] ?? [];
        set({
          byUser: {
            ...get().byUser,
            [userId]: list.filter((p) => p.id !== projectId),
          },
        });
      },
    }),
    { name: STORAGE.projects },
  ),
);
