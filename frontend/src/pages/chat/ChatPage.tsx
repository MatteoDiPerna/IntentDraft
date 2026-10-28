import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppPanelFrame, GlassPanel } from '@/components/brand';
import { ChatEditableUserMessage } from '@/components/chat/ChatEditableUserMessage';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { DocumentPreviewPanel } from '@/components/chat/DocumentPreviewPanel';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { FileInputButton } from '@/components/ui/FileInputButton';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useConversationStore } from '@/store/conversationStore';
import { useToast } from '@/components/ui/toast';
import {
  chatShellDocumentsRow,
  chatShellNewChatRow,
  chatShellPad,
  shellHeaderRow,
} from '@/lib/layout';
import { cn } from '@/utils/cn';

export function ChatPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.currentUser)!;
  const locale = user.locale;
  const toast = useToast();

  const list = useConversationStore((s) => s.list(user.id));
  const active = useConversationStore((s) => s.getActive(user.id));
  const createConversation = useConversationStore((s) => s.createConversation);
  const setActive = useConversationStore((s) => s.setActive);
  const sendUserMessage = useConversationStore((s) => s.sendUserMessage);
  const editUserMessage = useConversationStore((s) => s.editUserMessage);
  const skipClarification = useConversationStore((s) => s.skipClarification);
  const regeneratePrompt = useConversationStore((s) => s.regeneratePrompt);
  const updatePromptText = useConversationStore((s) => s.updatePromptText);
  const addFiles = useConversationStore((s) => s.addFiles);
  const removeFile = useConversationStore((s) => s.removeFile);
  const togglePin = useConversationStore((s) => s.togglePin);
  const toggleInProject = useConversationStore((s) => s.toggleInProject);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);
  const renameConversation = useConversationStore((s) => s.renameConversation);

  const [draft, setDraft] = useState('');
  const [composerFiles, setComposerFiles] = useState<File[]>([]);
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false);

  const documentPreview = useUiStore((s) => s.documentPreview);
  const documentPreviewWidth = useUiStore((s) => s.documentPreviewWidth);
  const openDocumentPreview = useUiStore((s) => s.openDocumentPreview);
  const closeDocumentPreview = useUiStore((s) => s.closeDocumentPreview);
  const setDocumentPreviewWidth = useUiStore((s) => s.setDocumentPreviewWidth);

  useEffect(() => {
    if (list.length === 0) createConversation(user.id);
  }, [list.length, createConversation, user.id]);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale, i18n]);

  const conv = active;

  useEffect(() => {
    setDraft('');
    setComposerFiles([]);
  }, [conv?.id]);
  const busy = conv?.phase === 'analyzing' || conv?.phase === 'generating';
  const isEmptyChat = !conv || conv.messages.length === 0;
  const showComposer = isEmptyChat || conv?.phase === 'clarifying';
  const showResult = Boolean(conv?.promptText?.trim());

  const handleSend = async () => {
    if (!conv || busy) return;
    const text = draft.trim();
    if (!text) {
      toast(t('chat.emptyInput'));
      return;
    }
    setDraft('');
    const attachments = composerFiles;
    setComposerFiles([]);
    const err = await sendUserMessage(user.id, conv.id, text, locale, attachments);
    if (err === 'size') {
      setComposerFiles(attachments);
      toast(t('chat.fileTooLarge'));
    } else if (err === 'type') {
      setComposerFiles(attachments);
      toast(t('chat.fileType'));
    }
  };

  const handleCopy = async () => {
    if (!conv?.promptText) return;
    await navigator.clipboard.writeText(conv.promptText);
    toast(t('chat.copied'));
  };

  const handleRegenerate = async () => {
    if (!conv) return;
    await regeneratePrompt(user.id, conv.id, locale);
  };

  const onRegenerateClick = () => {
    if (!conv?.promptText) return;
    setRegenerateConfirmOpen(true);
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
        onNewChat={() => createConversation(user.id)}
        onSelect={(id) => setActive(user.id, id)}
        onDeleteRecent={(id) => deleteConversation(user.id, id)}
        onPinRecent={(id) => togglePin(user.id, id)}
        onMoveRecentToProject={(id) => toggleInProject(user.id, id)}
        onRenameRecent={(id, title) => renameConversation(user.id, id, title)}
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
            <div className={cn(shellHeaderRow, 'pointer-events-none')} aria-hidden />
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
                        files={conv.files.filter((f) => f.messageId === m.id)}
                        disabled={busy}
                        onAddFiles={onMessageFiles}
                        onRemoveFile={(fileId) => removeFile(user.id, conv.id, fileId)}
                        onSubmit={async (messageId, text) => {
                          await editUserMessage(user.id, conv.id, messageId, text, locale);
                        }}
                      />
                    ) : (
                      <div
                        key={m.id}
                        className="max-w-[95%] rounded-xl bg-muted px-3 py-2 text-sm whitespace-pre-wrap"
                      >
                        {m.content}
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

              {conv.phase === 'clarifying' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={() => skipClarification(user.id, conv.id, locale)}
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
    </div>
  );
}
