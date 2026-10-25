import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useConversationStore } from '@/store/conversationStore';
import { useToast } from '@/components/ui/toast';
import type { Conversation } from '@/types/conversation';
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

  const [draft, setDraft] = useState('');
  const [mobileDetails, setMobileDetails] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (list.length === 0) createConversation(user.id);
  }, [list.length, createConversation, user.id]);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale, i18n]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length, active?.phase]);

  const conv = active;
  const busy = conv?.phase === 'analyzing' || conv?.phase === 'generating';

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
    if (err === 'size') toast('File too large (max 5MB)');
    else if (err === 'type') toast('File type not allowed');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-8rem)]">
      <aside className="w-full lg:w-56 shrink-0 border rounded-lg p-3 bg-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">{t('chat.conversations')}</h2>
          <Button size="sm" variant="outline" onClick={() => createConversation(user.id)}>
            +
          </Button>
        </div>
        <ul className="space-y-1 max-h-48 lg:max-h-[70vh] overflow-y-auto">
          {list.length === 0 && (
            <li className="text-xs text-muted-foreground">{t('chat.emptyList')}</li>
          )}
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActive(user.id, c.id)}
                className={cn(
                  'w-full text-left text-sm px-2 py-1.5 rounded-md truncate',
                  conv?.id === c.id ? 'bg-accent' : 'hover:bg-muted',
                )}
              >
                {c.title || t('nav.newChat')}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {!conv ? (
          <p className="text-muted-foreground">{t('chat.welcome')}</p>
        ) : (
          <>
            <ConversationPanel
              conv={conv}
              draft={draft}
              setDraft={setDraft}
              onSend={handleSend}
              busy={busy}
              t={t}
              bottomRef={bottomRef}
              onSkip={() => skipClarification(user.id, conv.id, locale)}
              fileRef={fileRef}
              onFiles={onFiles}
              onRemoveFile={(id) => removeFile(user.id, conv.id, id)}
            />

            <div className="lg:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileDetails((v) => !v)}>
                {t('chat.details')}
              </Button>
            </div>

            <div className={cn('lg:grid lg:grid-cols-2 gap-4', mobileDetails ? 'grid' : 'hidden lg:grid')}>
              <InterpretationPanel conv={conv} t={t} />
              <PromptPanel
                conv={conv}
                t={t}
                onCopy={handleCopy}
                onRegenerate={handleRegenerate}
                onChange={(text) => updatePromptText(user.id, conv.id, text)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ConversationPanel({
  conv,
  draft,
  setDraft,
  onSend,
  busy,
  t,
  bottomRef,
  onSkip,
  fileRef,
  onFiles,
  onRemoveFile,
}: {
  conv: Conversation;
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  t: (k: string) => string;
  bottomRef: React.RefObject<HTMLDivElement>;
  onSkip: () => void;
  fileRef: React.RefObject<HTMLInputElement>;
  onFiles: (f: FileList | null) => void;
  onRemoveFile: (id: string) => void;
}) {
  return (
    <div className="flex flex-col flex-1 border rounded-lg bg-card min-h-[320px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conv.messages.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('chat.welcome')}</p>
        )}
        {conv.messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'max-w-[90%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
              m.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted',
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
        <div ref={bottomRef} />
      </div>

      {conv.phase === 'clarifying' && (
        <div className="px-4 pb-2">
          <Button type="button" variant="secondary" size="sm" onClick={onSkip}>
            {t('chat.skipAssumption')}
          </Button>
        </div>
      )}

      <div className="border-t p-3 space-y-2">
        <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
          <span>{t('chat.attachments')}:</span>
          <input ref={fileRef} type="file" multiple className="text-xs" onChange={(e) => onFiles(e.target.files)} />
          <span className="hidden sm:inline">{t('chat.uploadHint')}</span>
        </div>
        {conv.files.length > 0 && (
          <ul className="text-xs space-y-1">
            {conv.files.map((f) => (
              <li key={f.id} className="flex justify-between gap-2">
                <span className="truncate">{f.name}</span>
                <button type="button" className="text-destructive" onClick={() => onRemoveFile(f.id)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('chat.placeholder')}
            disabled={busy}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
          />
          <Button onClick={onSend} disabled={busy}>
            {t('chat.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InterpretationPanel({
  conv,
  t,
  className,
  sticky,
}: {
  conv: Conversation;
  t: (k: string) => string;
  className?: string;
  sticky?: boolean;
}) {
  const interp = conv.interpretation;
  if (!interp) {
    return (
      <div className={cn('border rounded-lg p-4 bg-card text-sm text-muted-foreground', className, sticky && 'xl:sticky xl:top-20')}>
        {t('chat.understood')} — …
      </div>
    );
  }
  return (
    <div className={cn('border rounded-lg p-4 bg-card space-y-2 text-sm', className, sticky && 'xl:sticky xl:top-20')}>
      <h3 className="font-semibold">{t('chat.understood')}</h3>
      <p>
        <span className="font-medium">{t('chat.objective')}:</span> {interp.objective}
      </p>
      {interp.context && (
        <p>
          <span className="font-medium">{t('chat.context')}:</span> {interp.context.slice(0, 200)}
          {interp.context.length > 200 ? '…' : ''}
        </p>
      )}
      {interp.audience && (
        <p>
          <span className="font-medium">{t('chat.audience')}:</span> {interp.audience}
        </p>
      )}
      {interp.assumptions.length > 0 && (
        <div>
          <span className="font-medium">{t('chat.assumptions')}:</span>
          <ul className="list-disc pl-5 mt-1">
            {interp.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PromptPanel({
  conv,
  t,
  onCopy,
  onRegenerate,
  onChange,
}: {
  conv: Conversation;
  t: (k: string) => string;
  onCopy: () => void;
  onRegenerate: () => void;
  onChange: (text: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4 bg-card flex flex-col gap-2 min-h-[200px]">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h3 className="font-semibold text-sm">{t('chat.promptTitle')}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onRegenerate} disabled={!conv.promptText}>
            {t('chat.regenerate')}
          </Button>
          <Button size="sm" onClick={onCopy} disabled={!conv.promptText}>
            {t('chat.copy')}
          </Button>
        </div>
      </div>
      <Textarea
        className="min-h-[180px] font-mono text-xs flex-1"
        value={conv.promptText}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…"
      />
    </div>
  );
}
