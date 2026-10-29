import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DOCUMENT_PREVIEW_DEFAULT_WIDTH } from '@/lib/documentPreviewLayout';
import { STORAGE } from '@/lib/storageKeys';

export type DocumentPreviewTarget = {
  conversationId: string;
  fileId: string;
  fileName: string;
  mimeType: string;
};

interface UiState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  projectsExpanded: boolean;
  documentsExpanded: boolean;
  documentPreview: DocumentPreviewTarget | null;
  documentPreviewWidth: number;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setProjectsExpanded: (open: boolean) => void;
  setDocumentsExpanded: (open: boolean) => void;
  openDocumentPreview: (target: DocumentPreviewTarget) => void;
  closeDocumentPreview: () => void;
  setDocumentPreviewWidth: (width: number) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      mobileSidebarOpen: false,
      projectsExpanded: true,
      documentsExpanded: true,
      documentPreview: null,
      documentPreviewWidth: DOCUMENT_PREVIEW_DEFAULT_WIDTH,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      setProjectsExpanded: (open) => set({ projectsExpanded: open }),
      setDocumentsExpanded: (open) => set({ documentsExpanded: open }),
      openDocumentPreview: (target) => set({ documentPreview: target }),
      closeDocumentPreview: () => set({ documentPreview: null }),
      setDocumentPreviewWidth: (width) => set({ documentPreviewWidth: width }),
    }),
    { name: STORAGE.ui },
  ),
);
