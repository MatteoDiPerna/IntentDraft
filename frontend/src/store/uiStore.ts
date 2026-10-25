import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  sidebarOpen: boolean;
  projectsExpanded: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setProjectsExpanded: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      projectsExpanded: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setProjectsExpanded: (open) => set({ projectsExpanded: open }),
    }),
    { name: 'promptpilot_ui_v1' },
  ),
);
