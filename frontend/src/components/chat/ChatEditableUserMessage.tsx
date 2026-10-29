import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '@/components/brand';
import { Pencil } from 'lucide-react';
import { FileInputButton } from '@/components/ui/FileInputButton';
import { Textarea } from '@/components/ui/textarea';
import type { AttachedFile } from '@/types/conversation';
import { formatMessageTime } from '@/lib/formatMessageTime';
import { cn } from '@/utils/cn';

type ChatEditableUserMessageProps = {
  messageId: string;
  content: string;
  createdAt?: string;
  files: AttachedFile[];
  disabled?: boolean;
  onAddFiles: (messageId: string, files: FileList | null) => void;
  onRemoveFile: (fileId: string) => void;
  onSubmit: (messageId: string, text: string) => void | Promise<void>;
};

function MessageFileList({
  files,
  editable,
  onRemove,
  className,
}: {
  files: AttachedFile[];
  editable?: boolean;
  onRemove?: (fileId: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  if (files.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {files.map((f) => (
        <li
          key={f.id}
          className={cn(
            'flex max-w-full items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]',
            editable
              ? 'border-primary/20 bg-primary/10 text-primary-foreground/90'
              : 'border-input bg-muted/50 text-foreground',
          )}
        >
          <span className="max-w-[140px] truncate">{f.name}</span>
          {editable && onRemove ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(f.id)}
              aria-label={t('chat.removeFile')}
            >
              ×
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ChatEditableUserMessage({
  messageId,
  content,
  createdAt,
  files,
  disabled,
  onAddFiles,
  onRemoveFile,
  onSubmit,
}: ChatEditableUserMessageProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [baselineFileIds, setBaselineFileIds] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(content);
  }, [content, editing]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const fileIdsKey = files
    .map((f) => f.id)
    .sort()
    .join(',');

  const startEdit = () => {
    if (disabled) return;
    setDraft(content);
    setBaselineFileIds(fileIdsKey);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(content);
    setEditing(false);
  };

  const submitEdit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (trimmed === content && fileIdsKey === baselineFileIds) {
      setEditing(false);
      return;
    }
    setEditing(false);
    await onSubmit(messageId, trimmed);
  };

  if (editing) {
    return (
      <GlassPanel compact className="group ml-auto flex w-full max-w-[95%] flex-col gap-2 p-3">
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('chat.placeholder')}
          disabled={disabled}
          rows={3}
          aria-label={t('chat.editMessage')}
          className="min-h-[72px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submitEdit();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              cancelEdit();
            }
          }}
        />
        <MessageFileList files={files} editable onRemove={onRemoveFile} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <FileInputButton
              label={t('chat.chooseFile')}
              disabled={disabled}
              onFiles={(list) => onAddFiles(messageId, list)}
            />
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {t('chat.uploadHint')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{t('chat.editMessageHint')}</p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="group ml-auto flex w-full max-w-[95%] flex-col items-end gap-1">
      <div className="flex items-start gap-1">
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={startEdit}
            className={cn(
              'max-w-full rounded-xl px-3 py-2 text-left text-sm whitespace-pre-wrap',
              'bg-primary text-primary-foreground transition-opacity',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              disabled ? 'cursor-not-allowed opacity-70' : 'hover:opacity-95',
            )}
          >
            {content}
          </button>
          <MessageFileList files={files} className="justify-end px-1" />
          {createdAt ? (
            <time
              dateTime={createdAt}
              className="px-1 text-[10px] tabular-nums text-muted-foreground"
            >
              {formatMessageTime(createdAt)}
            </time>
          ) : null}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={startEdit}
          aria-label={t('chat.editMessage')}
          className={cn(
            'mt-1 shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity',
            'group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            disabled && 'pointer-events-none opacity-0',
          )}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
