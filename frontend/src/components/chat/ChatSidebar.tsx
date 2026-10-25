import type React from 'react';
import { useState } from 'react';
import {
  ChevronDown,
  FolderKanban,
  PanelLeftClose,
  Pin,
  PenSquare,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/uiStore';
import type { Conversation } from '@/types/conversation';
import { shellHeaderRow } from '@/lib/layout';
import { cn } from '@/utils/cn';

type ChatSidebarProps = {
  conversations: Conversation[];
  activeId: string | undefined;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDeleteRecent: (id: string) => void;
  onPinRecent: (id: string) => void;
  onMoveRecentToProject: (id: string) => void;
  onRenameRecent: (id: string, title: string) => void;
};

function chatLabel(c: Conversation, fallback: string) {
  return c.title.trim() || fallback;
}

const rowActionClass =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-background/80 hover:text-foreground';

function RowAction({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group/tip relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(rowActionClass, destructive && 'hover:text-destructive')}
        aria-label={label}
        title={label}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full right-0 z-50 mb-1.5 max-w-[11rem]',
          'whitespace-normal rounded-md border bg-popover px-2 py-1 text-center text-[11px] font-medium leading-tight text-popover-foreground shadow-md',
          'opacity-0 transition-opacity duration-150',
          'group-hover/tip:opacity-100 group-focus-within/tip:opacity-100',
        )}
      >
        {label}
      </span>
    </div>
  );
}

function ChatListItem({
  active,
  label,
  onSelect,
  collapsed,
  recentActions,
  renaming,
  renameValue,
  renamePlaceholder,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
}: {
  active: boolean;
  label: string;
  onSelect: () => void;
  collapsed: boolean;
  recentActions?: {
    pinLabel: string;
    renameLabel: string;
    moveLabel: string;
    deleteLabel: string;
    onPin: () => void;
    onRename: () => void;
    onMove: () => void;
    onDelete: () => void;
  };
  renaming?: boolean;
  renameValue?: string;
  renamePlaceholder?: string;
  onRenameChange?: (value: string) => void;
  onRenameCommit?: () => void;
  onRenameCancel?: () => void;
}) {
  if (collapsed) {
    return (
      <button
        type="button"
        title={label}
        onClick={onSelect}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium',
          active ? 'bg-primary/15 text-primary font-semibold' : 'hover:bg-muted',
        )}
      >
        {label.charAt(0).toUpperCase()}
      </button>
    );
  }
  if (renaming) {
    return (
      <div className="flex min-w-0 items-center gap-1 rounded-lg bg-muted/50 px-2 py-1">
        <input
          type="text"
          value={renameValue ?? ''}
          placeholder={renamePlaceholder}
          onChange={(e) => onRenameChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onRenameCommit?.();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              onRenameCancel?.();
            }
          }}
          onBlur={() => onRenameCommit?.()}
          className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative min-w-0 overflow-hidden rounded-lg transition-colors',
        active ? 'bg-primary/15' : 'hover:bg-muted',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'block w-full truncate px-3 py-2 text-left text-sm transition-[padding]',
          'group-hover:pr-[7.25rem]',
          active ? 'text-primary font-medium' : '',
        )}
      >
        {label}
      </button>
      {recentActions && (
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 right-0 flex items-center pl-4 pr-0.5',
            'opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100',
            active
              ? 'bg-gradient-to-l from-primary/15 from-55% to-transparent'
              : 'bg-gradient-to-l from-muted from-55% to-transparent group-hover:from-muted',
          )}
        >
          <RowAction label={recentActions.renameLabel} onClick={recentActions.onRename}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </RowAction>
          <RowAction label={recentActions.moveLabel} onClick={recentActions.onMove}>
            <FolderKanban className="h-3.5 w-3.5" aria-hidden />
          </RowAction>
          <RowAction label={recentActions.deleteLabel} onClick={recentActions.onDelete} destructive>
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </RowAction>
          <RowAction label={recentActions.pinLabel} onClick={recentActions.onPin}>
            <Pin className="h-3.5 w-3.5" aria-hidden />
          </RowAction>
        </div>
      )}
    </div>
  );
}

function CollapsedIconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full justify-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        title={title}
        onClick={onClick}
      >
        {children}
      </Button>
    </div>
  );
}

export function ChatSidebar({
  conversations,
  activeId,
  onNewChat,
  onSelect,
  onDeleteRecent,
  onPinRecent,
  onMoveRecentToProject,
  onRenameRecent,
}: ChatSidebarProps) {
  const { t } = useTranslation();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const open = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const projectsExpanded = useUiStore((s) => s.projectsExpanded);
  const setProjectsExpanded = useUiStore((s) => s.setProjectsExpanded);

  const fallback = t('nav.newChat');
  const pinned = conversations.filter((c) => c.pinned);
  const inProject = conversations.filter((c) => c.inProject && !c.pinned);
  const recent = conversations.filter((c) => !c.pinned && !c.inProject);

  const startRename = (c: Conversation) => {
    setRenamingId(c.id);
    setRenameDraft(c.title.trim());
  };

  const commitRename = () => {
    if (!renamingId) return;
    onRenameRecent(renamingId, renameDraft);
    setRenamingId(null);
    setRenameDraft('');
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameDraft('');
  };

  const width = open ? 'w-[260px]' : 'w-[56px]';

  return (
    <aside
      className={cn(
        'flex h-full min-w-0 shrink-0 flex-col overflow-x-hidden border-r bg-muted/30 transition-[width] duration-200 ease-out',
        width,
      )}
    >
      <div
        className={cn(
          'flex items-center border-b bg-background/80',
          shellHeaderRow,
          open ? 'justify-between gap-2 px-2' : 'justify-center px-0',
        )}
      >
        {open ? (
          <>
            <div className="min-w-0 flex-1 pl-1">
              <BrandLogo variant="sidebar" linked={false} />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label={t('sidebar.collapse')}
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <BrandLogo variant="sidebarCollapsed" linked={false} onClick={toggleSidebar} />
        )}
      </div>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-1 p-2',
          open ? 'overflow-x-hidden overflow-y-auto' : 'overflow-hidden items-center',
        )}
      >
        {open ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-3 px-3 font-normal"
            onClick={onNewChat}
          >
            <PenSquare className="h-4 w-4 shrink-0" />
            <span>{t('sidebar.newChat')}</span>
          </Button>
        ) : (
          <CollapsedIconButton title={t('sidebar.newChat')} onClick={onNewChat}>
            <PenSquare className="h-4 w-4" />
          </CollapsedIconButton>
        )}

        {open ? (
          <div className="min-w-0 overflow-x-hidden">
            <div className="mt-2">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                onClick={() => setProjectsExpanded(!projectsExpanded)}
              >
                <FolderKanban className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{t('sidebar.projects')}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform',
                    projectsExpanded ? 'rotate-0' : '-rotate-90',
                  )}
                />
              </button>
              {projectsExpanded && (
                <div className="ml-2 border-l pl-2 pt-1 space-y-0.5">
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                    {t('sidebar.defaultProject')}
                  </p>
                  {inProject.length === 0 && (
                    <p className="px-3 py-1 text-xs text-muted-foreground">
                      {t('sidebar.emptyRecent')}
                    </p>
                  )}
                  {inProject.map((c) => (
                    <ChatListItem
                      key={c.id}
                      active={c.id === activeId}
                      label={chatLabel(c, fallback)}
                      onSelect={() => onSelect(c.id)}
                      collapsed={false}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Pin className="h-3.5 w-3.5" />
                {t('sidebar.pinned')}
              </div>
              <div className="space-y-0.5">
                {pinned.length === 0 && (
                  <p className="px-3 py-1 text-xs text-muted-foreground">{t('sidebar.emptyPinned')}</p>
                )}
                {pinned.map((c) => (
                  <ChatListItem
                    key={c.id}
                    active={c.id === activeId}
                    label={chatLabel(c, fallback)}
                    onSelect={() => onSelect(c.id)}
                    collapsed={false}
                  />
                ))}
              </div>
            </div>

            <div className="mt-3">
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                {t('sidebar.recent')}
              </p>
              <div className="space-y-0.5">
                {recent.length === 0 && (
                  <p className="px-3 py-1 text-xs text-muted-foreground">{t('sidebar.emptyRecent')}</p>
                )}
                {recent.map((c) => (
                  <ChatListItem
                    key={c.id}
                    active={c.id === activeId}
                    label={chatLabel(c, fallback)}
                    onSelect={() => onSelect(c.id)}
                    collapsed={false}
                    renaming={renamingId === c.id}
                    renameValue={renameDraft}
                    renamePlaceholder={t('sidebar.renamePlaceholder')}
                    onRenameChange={setRenameDraft}
                    onRenameCommit={commitRename}
                    onRenameCancel={cancelRename}
                    recentActions={
                      renamingId === c.id
                        ? undefined
                        : {
                            pinLabel: t('sidebar.pinChat'),
                            renameLabel: t('sidebar.renameChat'),
                            moveLabel: t('sidebar.moveToProject'),
                            deleteLabel: t('sidebar.deleteChat'),
                            onPin: () => onPinRecent(c.id),
                            onRename: () => startRename(c),
                            onMove: () => onMoveRecentToProject(c.id),
                            onDelete: () => onDeleteRecent(c.id),
                          }
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex w-full flex-col items-center gap-1">
            <CollapsedIconButton title={t('sidebar.projects')} onClick={toggleSidebar}>
              <FolderKanban className="h-4 w-4" />
            </CollapsedIconButton>
            <CollapsedIconButton title={t('sidebar.pinned')} onClick={toggleSidebar}>
              <Pin className="h-4 w-4" />
            </CollapsedIconButton>
          </div>
        )}
      </div>
    </aside>
  );
}
