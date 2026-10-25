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
  addFiles: (userId: string, conversationId: string, files: File[]) => string | null;
  removeFile: (userId: string, conversationId: string, fileId: string) => void;
  updatePromptText: (userId: string, conversationId: string, text: string) => void;
  sendUserMessage: (
    userId: string,
    conversationId: string,
    text: string,
    locale: Locale,
  ) => Promise<void>;
  skipClarification: (userId: string, conversationId: string, locale: Locale) => Promise<void>;
  regeneratePrompt: (userId: string, conversationId: string, locale: Locale) => Promise<void>;
  togglePin: (userId: string, conversationId: string) => void;
  toggleInProject: (userId: string, conversationId: string) => void;
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

function normalizeConversation(c: Conversation): Conversation {
  return {
    ...c,
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
      addFiles: (userId, conversationId, files) => {
        for (const f of files) {
          if (f.size > MAX_FILE_BYTES) return 'size';
          if (!ALLOWED_MIME.includes(f.type) && f.type !== '') return 'type';
        }
        const attached: AttachedFile[] = files.map((f) => ({
          id: createId(),
          name: f.name,
          size: f.size,
          mimeType: f.type || 'application/octet-stream',
        }));
        const conv = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv) return 'missing';
        set(
          patchConversation(get(), userId, conversationId, {
            files: [...conv.files, ...attached],
          }),
        );
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
      },
      updatePromptText: (userId, conversationId, text) => {
        set(patchConversation(get(), userId, conversationId, { promptText: text }));
      },
      sendUserMessage: async (userId, conversationId, text, locale) => {
        const trimmed = text.trim();
        if (!trimmed) {
          set(patchConversation(get(), userId, conversationId, { phase: 'idle' }));
          return;
        }

        const conv0 = (get().byUser[userId] ?? []).find((c) => c.id === conversationId);
        if (!conv0) return;

        const userMsg: ChatMessage = {
          id: createId(),
          role: 'user',
          content: trimmed,
          createdAt: new Date().toISOString(),
        };
        let conv: Conversation = {
          ...conv0,
          messages: [...conv0.messages, userMsg],
          title: conv0.title || trimmed.slice(0, 48),
          phase: 'analyzing',
        };
        set(patchConversation(get(), userId, conversationId, conv));

        await delay(700);

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

        const userTexts = conv.messages.filter((m) => m.role === 'user').map((m) => m.content);
        const latest = userTexts[0] ?? trimmed;
        const clarifications = buildClarifications(latest, locale);

        if (
          conv0.phase === 'clarifying' ||
          (conv0.pendingQuestions.length > 0 && conv0.promptText === '')
        ) {
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
    }),
    { name: 'promptpilot_conversations_v1' },
  ),
);
