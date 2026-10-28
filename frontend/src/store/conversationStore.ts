import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttachedFile, ChatMessage, Conversation } from '@/types/conversation';
import { createId } from '@/lib/ids';
import {
  assistantReplyForQuestions,
  buildClarifications,
  buildInterpretation,
  buildPrompt,
  detectUnsupported,
} from '@/lib/mockConversationEngine';
import type { Locale } from '@/types/auth';
import {
  deleteFileBlob,
  deleteFileBlobs,
  persistAttachmentBlobs,
} from '@/lib/fileBlobStore';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = [
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function emptyConversation(): Conversation {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: '',
    messages: [],
    phase: 'idle',
    interpretation: null,
    pendingQuestions: [],
    clarificationTurns: 0,
    promptText: '',
    files: [],
    updatedAt: now,
    pinned: false,
    inProject: false,
  };
}

interface ConversationState {
  byUser: Record<string, Conversation[]>;
  activeId: Record<string, string | null>;
  createConversation: (userId: string) => string;
  setActive: (userId: string, conversationId: string) => void;
  getActive: (userId: string) => Conversation | null;
  list: (userId: string) => Conversation[];
  addFiles: (
    userId: string,
    conversationId: string,
    messageId: string,
    files: File[],
  ) => string | null;
  removeFile: (userId: string, conversationId: string, fileId: string) => void;
  updatePromptText: (userId: string, conversationId: string, text: string) => void;
  sendUserMessage: (
    userId: string,
    conversationId: string,
    text: string,
    locale: Locale,
    attachmentFiles?: File[],
  ) => Promise<'size' | 'type' | 'missing' | null>;
  editUserMessage: (
    userId: string,
    conversationId: string,
    messageId: string,
    text: string,
    locale: Locale,
  ) => Promise<void>;
  skipClarification: (userId: string, conversationId: string, locale: Locale) => Promise<void>;
  regeneratePrompt: (userId: string, conversationId: string, locale: Locale) => Promise<void>;
  togglePin: (userId: string, conversationId: string) => void;
  toggleInProject: (userId: string, conversationId: string) => void;
  deleteConversation: (userId: string, conversationId: string) => void;
  renameConversation: (userId: string, conversationId: string, title: string) => void;
}

function patchConversation(
  state: ConversationState,
  userId: string,
  conversationId: string,
  patch: Partial<Conversation>,
): ConversationState {
  const list = state.byUser[userId] ?? [];
  const next = list.map((c) =>
    c.id === conversationId ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c,
  );
  return { ...state, byUser: { ...state.byUser, [userId]: next } };
}

async function delay(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function runConversationPipeline(
  get: () => ConversationState,
  set: (partial: ConversationState | ((state: ConversationState) => ConversationState)) => void,
  userId: string,
  conversationId: string,
  locale: Locale,
  triggerText: string,
): Promise<void> {
  await delay(700);

  let conv = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
  if (!conv) return;

  const trimmed = triggerText.trim();
  if (detectUnsupported(trimmed)) {
    const assistant: ChatMessage = {
      id: createId(),
      role: 'assistant',
      content:
        locale === 'it'
          ? 'Non posso aiutare con consigli medici o legali. Prova con attività di lavoro o comunicazione.'
          : "I can't help with medical or legal advice. Try work or communication tasks.",
      createdAt: new Date().toISOString(),
    };
    set(
      patchConversation(get(), userId, conversationId, {
        messages: [...conv.messages, assistant],
        phase: 'idle',
        pendingQuestions: [],
      }),
    );
    return;
  }

  conv = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
  if (!conv) return;

  const userTexts = conv.messages.filter((m) => m.role === 'user').map((m) => m.content);
  const latest = userTexts[0] ?? trimmed;
  const clarifications = buildClarifications(latest, locale);

  if (userTexts.length > 1) {
    const answers = userTexts.slice(1);
    const interpretation = buildInterpretation(latest, answers, locale);
    set(
      patchConversation(get(), userId, conversationId, {
        phase: 'generating',
        interpretation,
        pendingQuestions: [],
        clarificationTurns: conv.clarificationTurns + 1,
      }),
    );
    await delay(600);
    const promptText = buildPrompt(interpretation, locale, 0);
    set(
      patchConversation(get(), userId, conversationId, {
        promptText,
        phase: 'prompt_ready',
      }),
    );
    return;
  }

  if (clarifications.length > 0 && conv.clarificationTurns < 2 && conv.promptText === '') {
    const assistant: ChatMessage = {
      id: createId(),
      role: 'assistant',
      content: assistantReplyForQuestions(clarifications, locale),
      createdAt: new Date().toISOString(),
    };
    set(
      patchConversation(get(), userId, conversationId, {
        messages: [...conv.messages, assistant],
        phase: 'clarifying',
        pendingQuestions: clarifications,
      }),
    );
    return;
  }

  const answers = conv.messages
    .filter((m) => m.role === 'user')
    .slice(1)
    .map((m) => m.content);
  const interpretation = buildInterpretation(latest, answers, locale);
  set(
    patchConversation(get(), userId, conversationId, {
      phase: 'generating',
      interpretation,
      pendingQuestions: [],
    }),
  );
  await delay(600);
  const promptText = buildPrompt(interpretation, locale, 0);
  set(
    patchConversation(get(), userId, conversationId, {
      promptText,
      phase: 'prompt_ready',
      clarificationTurns: conv.clarificationTurns + (clarifications.length ? 1 : 0),
    }),
  );
}

function validateFiles(files: File[]): 'size' | 'type' | null {
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) return 'size';
    if (!ALLOWED_MIME.includes(f.type) && f.type !== '') return 'type';
  }
  return null;
}

function mapFilesToMessage(messageId: string, files: File[]): AttachedFile[] {
  return files.map((f) => ({
    id: createId(),
    messageId,
    name: f.name,
    size: f.size,
    mimeType: f.type || 'application/octet-stream',
  }));
}

function normalizeConversation(c: Conversation): Conversation {
  const firstUserId = c.messages.find((m) => m.role === 'user')?.id;
  const files = c.files.map((f) => {
    const row = f as AttachedFile & { messageId?: string };
    if (row.messageId) return row;
    return { ...row, messageId: firstUserId ?? row.id };
  });
  return {
    ...c,
    files,
    pinned: c.pinned ?? false,
    inProject: c.inProject ?? false,
  };
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      byUser: {},
      activeId: {},
      createConversation: (userId) => {
        const conv = emptyConversation();
        const list = get().byUser[userId] ?? [];
        set({
          byUser: { ...get().byUser, [userId]: [conv, ...list] },
          activeId: { ...get().activeId, [userId]: conv.id },
        });
        return conv.id;
      },
      setActive: (userId, conversationId) => {
        set({ activeId: { ...get().activeId, [userId]: conversationId } });
      },
      getActive: (userId) => {
        const id = get().activeId[userId];
        if (!id) return null;
        const c = (get().byUser[userId] ?? []).find((x) => x.id === id);
        return c ? normalizeConversation(c) : null;
      },
      list: (userId) => (get().byUser[userId] ?? []).map(normalizeConversation),
      addFiles: (userId, conversationId, messageId, files) => {
        const err = validateFiles(files);
        if (err) return err;
        const attached = mapFilesToMessage(messageId, files);
        const conv = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv) return 'missing';
        set(
          patchConversation(get(), userId, conversationId, {
            files: [...conv.files, ...attached],
          }),
        );
        persistAttachmentBlobs(attached, files);
        return null;
      },
      removeFile: (userId, conversationId, fileId) => {
        const conv = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv) return;
        set(
          patchConversation(get(), userId, conversationId, {
            files: conv.files.filter((f) => f.id !== fileId),
          }),
        );
        void deleteFileBlob(fileId);
      },
      updatePromptText: (userId, conversationId, text) => {
        set(patchConversation(get(), userId, conversationId, { promptText: text }));
      },
      sendUserMessage: async (userId, conversationId, text, locale, attachmentFiles = []) => {
        const trimmed = text.trim();
        if (!trimmed) {
          set(patchConversation(get(), userId, conversationId, { phase: 'idle' }));
          return null;
        }

        const conv0 = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv0) return 'missing';

        const fileErr = validateFiles(attachmentFiles);
        if (fileErr) return fileErr;

        const userMsg: ChatMessage = {
          id: createId(),
          role: 'user',
          content: trimmed,
          createdAt: new Date().toISOString(),
        };
        const newFiles = mapFilesToMessage(userMsg.id, attachmentFiles);
        const conv: Conversation = {
          ...conv0,
          messages: [...conv0.messages, userMsg],
          files: [...conv0.files, ...newFiles],
          title: conv0.title || trimmed.slice(0, 48),
          phase: 'analyzing',
        };
        set(patchConversation(get(), userId, conversationId, conv));
        persistAttachmentBlobs(newFiles, attachmentFiles);

        await runConversationPipeline(get, set, userId, conversationId, locale, trimmed);
        return null;
      },
      editUserMessage: async (userId, conversationId, messageId, text, locale) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const conv0 = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv0) return;

        const idx = conv0.messages.findIndex((m) => m.id === messageId);
        if (idx < 0 || conv0.messages[idx].role !== 'user') return;

        const firstUserIdx = conv0.messages.findIndex((m) => m.role === 'user');
        const contentUnchanged = conv0.messages[idx].content === trimmed;
        const updatedMsg: ChatMessage = { ...conv0.messages[idx], content: trimmed };
        const messages = contentUnchanged
          ? conv0.messages
          : [...conv0.messages.slice(0, idx), updatedMsg];
        const survivingMessageIds = new Set(messages.map((m) => m.id));
        const userCountAfter = messages.filter((m) => m.role === 'user').length;
        const clarificationTurns =
          idx === firstUserIdx ? 0 : Math.max(0, userCountAfter - 1);

        set(
          patchConversation(get(), userId, conversationId, {
            messages,
            files: conv0.files.filter((f) => survivingMessageIds.has(f.messageId)),
            title: idx === firstUserIdx ? trimmed.slice(0, 48) : conv0.title,
            promptText: '',
            interpretation: null,
            pendingQuestions: [],
            clarificationTurns,
            phase: 'analyzing',
          }),
        );

        await runConversationPipeline(get, set, userId, conversationId, locale, trimmed);
      },
      skipClarification: async (userId, conversationId, locale) => {
        const conv = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv) return;
        const userTexts = conv.messages.filter((m) => m.role === 'user').map((m) => m.content);
        const latest = userTexts[0] ?? '';
        const interpretation = buildInterpretation(latest, [], locale);
        interpretation.assumptions.push(
          locale === 'it'
            ? 'Dettagli mancanti: scelte ragionevoli per PMI/professionisti.'
            : 'Missing details filled with reasonable professional defaults.',
        );
        set(
          patchConversation(get(), userId, conversationId, {
            phase: 'generating',
            interpretation,
            pendingQuestions: [],
            clarificationTurns: conv.clarificationTurns + 1,
          }),
        );
        await delay(500);
        const promptText = buildPrompt(interpretation, locale, 0);
        set(
          patchConversation(get(), userId, conversationId, {
            promptText,
            phase: 'prompt_ready',
          }),
        );
      },
      regeneratePrompt: async (userId, conversationId, locale) => {
        const conv = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv?.interpretation) return;
        set(patchConversation(get(), userId, conversationId, { phase: 'generating' }));
        await delay(500);
        const variant = Math.floor(Math.random() * 3) + 1;
        const promptText = buildPrompt(conv.interpretation, locale, variant);
        set(
          patchConversation(get(), userId, conversationId, {
            promptText,
            phase: 'prompt_ready',
          }),
        );
      },
      togglePin: (userId, conversationId) => {
        const conv = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv) return;
        set(
          patchConversation(get(), userId, conversationId, {
            pinned: !normalizeConversation(conv).pinned,
          }),
        );
      },
      toggleInProject: (userId, conversationId) => {
        const conv = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv) return;
        set(
          patchConversation(get(), userId, conversationId, {
            inProject: !normalizeConversation(conv).inProject,
          }),
        );
      },
      deleteConversation: (userId, conversationId) => {
        const list = get().byUser[userId] ?? [];
        const removed = list.find((c) => c.id === conversationId);
        const next = list.filter((c) => c.id !== conversationId);
        if (next.length === list.length) return;

        if (removed?.files.length) {
          void deleteFileBlobs(removed.files.map((f) => f.id));
        }

        const wasActive = get().activeId[userId] === conversationId;
        const nextActive = wasActive ? (next[0]?.id ?? null) : get().activeId[userId];

        set({
          byUser: { ...get().byUser, [userId]: next },
          activeId: { ...get().activeId, [userId]: nextActive },
        });
      },
      renameConversation: (userId, conversationId, title) => {
        set(
          patchConversation(get(), userId, conversationId, {
            title: title.trim(),
          }),
        );
      },
    }),
    { name: 'promptpilot_conversations_v1' },
  ),
);
