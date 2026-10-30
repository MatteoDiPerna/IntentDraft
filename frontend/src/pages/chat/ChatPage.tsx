import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { AppPanelFrame, GlassPanel } from '@/components/brand';
import { ChatEditableUserMessage } from '@/components/chat/ChatEditableUserMessage';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { DocumentPreviewPanel } from '@/components/chat/DocumentPreviewPanel';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { FileInputButton } from '@/components/ui/FileInputButton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';
import { useConversationStore } from '@/store/conversationStore';
import { useToast } from '@/components/ui/toast';
import { appConfig } from '@/config';
import { loadConversationDetailFromApi } from '@/adapters/api/apiConversationAdapter';
import { isRecoverableApiError } from '@/api/client';
import { formatMessageTime } from '@/lib/formatMessageTime';
import {
  chatShellDocumentsRow,
  chatShellNewChatRow,
  chatShellPad,
  shellHeaderRow,
} from '@/lib/layout';
import { cn } from '@/utils/cn';

export function ChatPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const ports = usePorts();
  const locale = user?.locale ?? 'it';
  const toast = useToast();
  const showApiError = useApiErrorToast();
  const maxChars = appConfig.maxMessageChars;
  const pendingRetryRef = useRef<(() => Promise<void>) | null>(null);

  const userId = user?.id ?? '';
  const list = useConversationStore((s) => (userId ? s.list(userId) : []));
  const active = useConversationStore((s) => (userId ? s.getActive(userId) : null));
  const createConversation = useConversationStore((s) => s.createConversation);
  const setActive = useConversationStore((s) => s.setActive);
  const updatePromptText = useConversationStore((s) => s.updatePromptText);
  const addFiles = useConversationStore((s) => s.addFiles);
  const removeFile = useConversationStore((s) => s.removeFile);
  const togglePin = useConversationStore((s) => s.togglePin);
  const toggleInProject = useConversationStore((s) => s.toggleInProject);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);
  const renameConversation = useConversationStore((s) => s.renameConversation);
  const setPhase = useConversationStore((s) => s.setPhase);

  const [draft, setDraft] = useState('');
  const [composerFiles, setComposerFiles] = useState<File[]>([]);
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [understoodOpen, setUnderstoodOpen] = useState(false);
  const [promptBaseline, setPromptBaseline] = useState('');
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const statusLiveRef = useRef<HTMLDivElement>(null);

  const documentPreview = useUiStore((s) => s.documentPreview);
  const documentPreviewWidth = useUiStore((s) => s.documentPreviewWidth);
  const openDocumentPreview = useUiStore((s) => s.openDocumentPreview);
  const closeDocumentPreview = useUiStore((s) => s.closeDocumentPreview);
  const setDocumentPreviewWidth = useUiStore((s) => s.setDocumentPreviewWidth);

  useEffect(() => {
    if (!user) return;
    if (list.length === 0) {
      if (appConfig.useMock) createConversation(user.id);
      else void ports.conversations.create(user.id);
    }
  }, [list.length, createConversation, ports.conversations, user?.id, user]);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale, i18n]);

  const conv = active;

  useEffect(() => {
    if (!user || appConfig.useMock || !conv?.id) return;
    void loadConversationDetailFromApi(user.id, conv.id);
  }, [user, conv?.id]);

  useEffect(() => {
    setDraft('');
    setComposerFiles([]);
    setUnderstoodOpen(false);
  }, [conv?.id]);

  useEffect(() => {
    if (conv?.phase === 'prompt_ready' && conv.promptText) {
      setPromptBaseline(conv.promptText);
    }
  }, [conv?.id, conv?.phase, conv?.promptText]);
  const busy = conv?.phase === 'analyzing' || conv?.phase === 'generating';
  const recoverableError = conv?.phase === 'error_recoverable';
  const isEmptyChat = !conv || conv.messages.length === 0;
  const showComposer = isEmptyChat || conv?.phase === 'clarifying';
  const showResult = Boolean(conv?.promptText?.trim());

  if (!user) return null;

  const runSend = async (text: string, attachments: File[]) => {
    if (!conv) return;
    pendingRetryRef.current = () => runSend(text, attachments);
    setPhase(user.id, conv.id, 'idle');
    try {
      const err = await ports.messages.send(user.id, conv.id, text, locale, attachments);
      if (err === 'size') {
        setComposerFiles(attachments);
        toast(t('chat.fileTooLarge'));
      } else if (err === 'type') {
        setComposerFiles(attachments);
        toast(t('chat.fileType'));
      }
    } catch (e) {
      if (isRecoverableApiError(e)) {
        showApiError(e);
        setPhase(user.id, conv.id, 'error_recoverable');
        setDraft(text);
        setComposerFiles(attachments);
      } else {
        showApiError(e);
      }
    }
  };

  const handleSend = async () => {
    if (!conv || busy) return;
    const text = draft.trim();
    if (!text) {
      toast(t('chat.emptyInput'));
      return;
    }
    if (text.length > maxChars) {
      toast(t('chat.charLimit'));
      return;
    }
    setDraft('');
    const attachments = composerFiles;
    setComposerFiles([]);
    await runSend(text, attachments);
  };

  const handleRetry = async () => {
    if (!conv || !pendingRetryRef.current) return;
    await pendingRetryRef.current();
  };

  const handleCopy = async () => {
    if (!conv?.promptText) return;
    await navigator.clipboard.writeText(conv.promptText);
    toast(t('chat.copied'));
  };

  const handleRegenerate = async () => {
    if (!conv) return;
    pendingRetryRef.current = () => handleRegenerate();
    setPhase(user.id, conv.id, 'idle');
    try {
      await ports.messages.regeneratePrompt(user.id, conv.id, locale);
      setPromptBaseline(conv.promptText);
    } catch (e) {
      if (isRecoverableApiError(e)) {
        showApiError(e);
        setPhase(user.id, conv.id, 'error_recoverable');
      } else {
        showApiError(e);
      }
    }
  };

  const onRegenerateClick = () => {
    if (!conv?.promptText) return;
    if (conv.promptText !== promptBaseline) setRegenerateConfirmOpen(true);
    else void handleRegenerate();
  };

  const confirmRegenerate = async () => {
    setRegenerateConfirmOpen(false);
    await handleRegenerate();
  };

  const onComposerFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files);
    for (const f of next) {
      if (f.size > 5 * 1024 * 1024) {
        toast(t('chat.fileTooLarge'));
        return;
      }
    }
    setComposerFiles((prev) => [...prev, ...next]);
  };

  const onMessageFiles = (messageId: string, files: FileList | null) => {
    if (!conv || !files?.length) return;
    const err = addFiles(user.id, conv.id, messageId, Array.from(files));
    if (err === 'size') toast(t('chat.fileTooLarge'));
    else if (err === 'type') toast(t('chat.fileType'));
  };

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden">
      {documentPreview && (
        <button
          type="button"
          className="document-preview-backdrop-enter fixed inset-0 z-40 bg-background/45 backdrop-blur-md"
          aria-label={t('documentPreview.closeBackdrop')}
          onClick={closeDocumentPreview}
        />
      )}

      <ChatSidebar
        conversations={list}
        activeId={conv?.id}
        onNewChat={() => {
          if (appConfig.useMock) createConversation(user.id);
          else void ports.conversations.create(user.id);
        }}
        onSelect={(id) => setActive(user.id, id)}
        onDeleteRecent={(id) => setDeleteTargetId(id)}
        onPinRecent={(id) => {
          if (appConfig.useMock) togglePin(user.id, id);
          else void ports.conversations.togglePin(user.id, id);
        }}
        onMoveRecentToProject={(id) => {
          if (appConfig.useMock) toggleInProject(user.id, id);
          else void ports.conversations.toggleInProject(user.id, id);
        }}
        onRenameRecent={(id, title) => {
          if (appConfig.useMock) renameConversation(user.id, id, title);
          else void ports.conversations.rename(user.id, id, title);
        }}
        onOpenDocument={(conversationId, file) => {
          setActive(user.id, conversationId);
          openDocumentPreview({
            conversationId,
            fileId: file.id,
            fileName: file.name,
            mimeType: file.mimeType,
          });
        }}
      />

      <AppPanelFrame className={cn(documentPreview && 'relative z-10')}>
        {!conv ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">…</div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className={cn(shellHeaderRow, 'flex items-center gap-2 px-2 md:hidden')}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                aria-label={t('chat.openMenu')}
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className={cn(shellHeaderRow, 'pointer-events-none hidden md:block')} aria-hidden />
            <div ref={statusLiveRef} className="sr-only" aria-live="polite" aria-atomic="true">
              {recoverableError
                ? t('chat.errorRecoverable')
                : busy
                  ? conv.phase === 'generating'
                    ? t('chat.generating')
                    : t('chat.analyzing')
                  : ''}
            </div>
            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col px-2 md:px-4',
                chatShellPad,
              )}
            >
              <div className={chatShellNewChatRow} aria-hidden />
              <div
                className={cn(
                  'flex min-h-0 flex-1 flex-col overflow-y-auto',
                  isEmptyChat && !showResult && 'justify-center',
                )}
              >
                <div
                  className={cn(
                    'mx-auto flex w-full max-w-2xl flex-col gap-4 px-2 md:px-4',
                    showResult && 'min-h-0 flex-1',
                  )}
                >
              {isEmptyChat && (
                <div className="text-center">
                  <h1 className="brand-heading-hero">{t('chat.emptyTitle')}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">{t('chat.emptySubtitle')}</p>
                </div>
              )}

              {conv.messages.length > 0 && (
                <div className="max-h-[32vh] space-y-2 overflow-y-auto pr-1">
                  {conv.messages.map((m) =>
                    m.role === 'user' ? (
                      <ChatEditableUserMessage
                        key={m.id}
                        messageId={m.id}
                        content={m.content}
                        createdAt={m.createdAt}
                        files={conv.files.filter((f) => f.messageId === m.id)}
                        disabled={busy}
                        onAddFiles={onMessageFiles}
                        onRemoveFile={(fileId) => removeFile(user.id, conv.id, fileId)}
                        onSubmit={async (messageId, text) => {
                          pendingRetryRef.current = async () => {
                            await ports.messages.editUserMessage(
                              user.id,
                              conv.id,
                              messageId,
                              text,
                              locale,
                            );
                          };
                          setPhase(user.id, conv.id, 'idle');
                          try {
                            await ports.messages.editUserMessage(
                              user.id,
                              conv.id,
                              messageId,
                              text,
                              locale,
                            );
                          } catch (e) {
                            if (isRecoverableApiError(e)) {
                              showApiError(e);
                              setPhase(user.id, conv.id, 'error_recoverable');
                            } else {
                              showApiError(e);
                            }
                          }
                        }}
                      />
                    ) : (
                      <div key={m.id} className="flex max-w-[95%] flex-col gap-0.5">
                        <div className="rounded-xl bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
                          {m.content}
                        </div>
                        {m.createdAt ? (
                          <time
                            dateTime={m.createdAt}
                            className="text-[10px] tabular-nums text-muted-foreground"
                          >
                            {formatMessageTime(m.createdAt)}
                          </time>
                        ) : null}
                      </div>
                    ),
                  )}
                  {busy && (
                    <p className="text-sm text-muted-foreground animate-pulse">
                      {conv.phase === 'generating' ? t('chat.generating') : t('chat.analyzing')}
                    </p>
                  )}
                </div>
              )}

              {conv.interpretation && conv.phase !== 'idle' && (
                <GlassPanel compact className="p-3">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left text-sm font-medium"
                    onClick={() => setUnderstoodOpen((v) => !v)}
                  >
                    {t('chat.understoodTitle')}
                    <span className="text-xs text-muted-foreground">{t('chat.understoodToggle')}</span>
                  </button>
                  {understoodOpen && (
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li>
                        <strong>{conv.interpretation.objective}</strong>
                      </li>
                      {conv.interpretation.audience && <li>{conv.interpretation.audience}</li>}
                      {conv.interpretation.assumptions.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  )}
                </GlassPanel>
              )}

              {recoverableError && (
                <GlassPanel compact className="flex flex-wrap items-center justify-between gap-2 border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-sm text-destructive">{t('chat.errorRecoverable')}</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => void handleRetry()}>
                    {t('chat.retry')}
                  </Button>
                </GlassPanel>
              )}

              {conv.phase === 'clarifying' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={() => {
                    pendingRetryRef.current = async () => {
                      await ports.messages.skipClarification(user.id, conv.id, locale);
                    };
                    setPhase(user.id, conv.id, 'idle');
                    void ports.messages
                      .skipClarification(user.id, conv.id, locale)
                      .catch((e) => {
                        if (isRecoverableApiError(e)) {
                          showApiError(e);
                          setPhase(user.id, conv.id, 'error_recoverable');
                        } else {
                          showApiError(e);
                        }
                      });
                  }}
                >
                  {t('chat.skipAssumption')}
                </Button>
              )}

              {showComposer ? (
                <GlassPanel compact className="flex flex-col gap-2 p-3">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    disabled={busy}
                    rows={3}
                    className="min-h-[72px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-xs text-muted-foreground" title={t('chat.composeHint')}>
                      {t('chat.composeHint')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('chat.charCount', { count: draft.length, max: maxChars })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileInputButton
                        label={t('chat.chooseFile')}
                        disabled={busy}
                        onFiles={onComposerFiles}
                      />
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {t('chat.uploadHint')}
                      </span>
                    </div>
                    <Button
                      onClick={() => void handleSend()}
                      disabled={busy}
                      size="sm"
                      className="brand-btn-glow"
                    >
                      {t('chat.send')}
                    </Button>
                  </div>
                  {composerFiles.length > 0 && (
                    <ul className="flex flex-wrap gap-2 text-xs">
                      {composerFiles.map((f, i) => (
                        <li
                          key={`${f.name}-${f.size}-${i}`}
                          className="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1"
                        >
                          <span className="max-w-[160px] truncate">{f.name}</span>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setComposerFiles((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            aria-label={t('chat.removeFile')}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </GlassPanel>
              ) : null}

              {showResult ? (
                <GlassPanel compact className="flex min-h-0 flex-1 flex-col gap-2 p-4">
                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold">{t('chat.resultTitle')}</h2>
                      <p className="text-xs text-muted-foreground">{t('chat.resultHint')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onRegenerateClick}
                        disabled={!conv.promptText}
                      >
                        {t('chat.regenerate')}
                      </Button>
                      <Button size="sm" onClick={() => void handleCopy()} disabled={!conv.promptText}>
                        {t('chat.copy')}
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    className="min-h-0 flex-1 resize-y font-mono text-xs"
                    value={conv.promptText}
                    onChange={(e) => updatePromptText(user.id, conv.id, e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void ports.prompts.submitFeedback(user.id, conv.id, true).then(() =>
                          toast(t('chat.feedbackThanks')),
                        )
                      }
                    >
                      {t('chat.feedbackUseful')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void ports.prompts.submitFeedback(user.id, conv.id, false).then(() =>
                          toast(t('chat.feedbackThanks')),
                        )
                      }
                    >
                      {t('chat.feedbackNotUseful')}
                    </Button>
                  </div>
                </GlassPanel>
              ) : (
                !isEmptyChat &&
                !busy && (
                  <p className="text-center text-xs text-muted-foreground">{t('chat.generating')}</p>
                )
              )}
                </div>
              </div>
              <div className={chatShellDocumentsRow} aria-hidden />
            </div>
          </div>
        )}
      </AppPanelFrame>

      {documentPreview && (
        <DocumentPreviewPanel
          key={documentPreview.fileId}
          fileId={documentPreview.fileId}
          fileName={documentPreview.fileName}
          mimeType={documentPreview.mimeType}
          width={documentPreviewWidth}
          onWidthChange={setDocumentPreviewWidth}
          onClose={closeDocumentPreview}
        />
      )}

      <ConfirmModal
        open={regenerateConfirmOpen}
        message={t('chat.regenerateConfirm')}
        confirmLabel={t('chat.continue')}
        cancelLabel={t('chat.cancel')}
        onConfirm={() => void confirmRegenerate()}
        onCancel={() => setRegenerateConfirmOpen(false)}
      />
      <ConfirmModal
        open={Boolean(deleteTargetId)}
        message={t('chat.deleteChatConfirm')}
        confirmLabel={t('sidebar.deleteChat')}
        cancelLabel={t('chat.cancel')}
        onConfirm={() => {
          if (deleteTargetId) {
            if (appConfig.useMock) deleteConversation(user.id, deleteTargetId);
            else void ports.conversations.delete(user.id, deleteTargetId);
          }
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
