import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  sidebarOpen: boolean;
  projectsExpanded: boolean;
  documentsExpanded: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setProjectsExpanded: (open: boolean) => void;
  setDocumentsExpanded: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      projectsExpanded: true,
      documentsExpanded: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setProjectsExpanded: (open) => set({ projectsExpanded: open }),
      setDocumentsExpanded: (open) => set({ documentsExpanded: open }),
    }),
    { name: 'promptpilot_ui_v1' },
  ),
);
