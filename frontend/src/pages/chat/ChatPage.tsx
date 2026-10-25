import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pin, PinOff } from 'lucide-react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { Button } from '@/components/ui/button';
import { FileInputButton } from '@/components/ui/FileInputButton';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useConversationStore } from '@/store/conversationStore';
import { useToast } from '@/components/ui/toast';
import { shellHeaderRow } from '@/lib/layout';
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
  const skipClarification = useConversationStore((s) => s.skipClarification);
  const regeneratePrompt = useConversationStore((s) => s.regeneratePrompt);
  const updatePromptText = useConversationStore((s) => s.updatePromptText);
  const addFiles = useConversationStore((s) => s.addFiles);
  const removeFile = useConversationStore((s) => s.removeFile);
  const togglePin = useConversationStore((s) => s.togglePin);
  const toggleInProject = useConversationStore((s) => s.toggleInProject);

  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (list.length === 0) createConversation(user.id);
  }, [list.length, createConversation, user.id]);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale, i18n]);

  const conv = active;
  const busy = conv?.phase === 'analyzing' || conv?.phase === 'generating';
  const isEmptyChat = !conv || conv.messages.length === 0;
  const showResult = Boolean(conv?.promptText?.trim());

  const handleSend = async () => {
    if (!conv || busy) return;
    const text = draft.trim();
    if (!text) {
      toast(t('chat.emptyInput'));
      return;
    }
    setDraft('');
    await sendUserMessage(user.id, conv.id, text, locale);
  };

  const handleCopy = async () => {
    if (!conv?.promptText) return;
    await navigator.clipboard.writeText(conv.promptText);
    toast(t('chat.copied'));
  };

  const handleRegenerate = async () => {
    if (!conv) return;
    if (conv.promptText && !window.confirm(t('chat.regenerateConfirm'))) return;
    await regeneratePrompt(user.id, conv.id, locale);
  };

  const onFiles = (files: FileList | null) => {
    if (!conv || !files?.length) return;
    const err = addFiles(user.id, conv.id, Array.from(files));
    if (err === 'size') toast(t('chat.fileTooLarge'));
    else if (err === 'type') toast(t('chat.fileType'));
  };

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <ChatSidebar
        conversations={list}
        activeId={conv?.id}
        onNewChat={() => createConversation(user.id)}
        onSelect={(id) => setActive(user.id, id)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!conv ? (
          <>
            <div className={cn('border-b bg-background/80', shellHeaderRow)} aria-hidden />
            <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
              …
            </div>
          </>
        ) : (
          <>
            <div
              className={cn(
                'flex items-center justify-end gap-1 border-b bg-background/80 px-3',
                shellHeaderRow,
              )}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => toggleInProject(user.id, conv.id)}
              >
                {conv.inProject ? t('sidebar.projects') : t('chat.addToProject')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={conv.pinned ? t('chat.unpinChat') : t('chat.pinChat')}
                onClick={() => togglePin(user.id, conv.id)}
              >
                {conv.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="shrink-0 border-b px-4 py-4 md:px-8">
                {isEmptyChat && (
                  <div className="mx-auto max-w-2xl text-center mb-4">
                    <h1 className="text-lg font-bold">{t('chat.emptyTitle')}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t('chat.emptySubtitle')}</p>
                  </div>
                )}

                <div className="mx-auto flex max-w-2xl flex-col gap-2">
                  {conv.messages.length > 0 && (
                    <div className="max-h-[28vh] space-y-2 overflow-y-auto pr-1">
                      {conv.messages.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            'max-w-[95%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap',
                            m.role === 'user'
                              ? 'ml-auto bg-primary text-primary-foreground'
                              : 'bg-muted',
                          )}
                        >
                          {m.content}
                        </div>
                      ))}
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

                  <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm">
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
                          onFiles={onFiles}
                        />
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {t('chat.uploadHint')}
                        </span>
                      </div>
                      <Button onClick={() => void handleSend()} disabled={busy} size="sm">
                        {t('chat.send')}
                      </Button>
                    </div>
                    {conv.files.length > 0 && (
                      <ul className="flex flex-wrap gap-2 text-xs">
                        {conv.files.map((f) => (
                          <li
                            key={f.id}
                            className="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1"
                          >
                            <span className="max-w-[160px] truncate">{f.name}</span>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => removeFile(user.id, conv.id, f.id)}
                              aria-label="Remove"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-8">
                <div className="mx-auto max-w-2xl">
                  {showResult ? (
                    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="text-sm font-semibold">{t('chat.resultTitle')}</h2>
                          <p className="text-xs text-muted-foreground">{t('chat.resultHint')}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleRegenerate()}
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
                        className="min-h-[120px] font-mono text-xs"
                        value={conv.promptText}
                        onChange={(e) => updatePromptText(user.id, conv.id, e.target.value)}
                      />
                    </div>
                  ) : (
                    !isEmptyChat &&
                    !busy && (
                      <p className="text-center text-xs text-muted-foreground">{t('chat.generating')}</p>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
