import type React from 'react';
import { useState } from 'react';
import {
  ChevronDown,
  FileSpreadsheet,
  FileText,
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
import type { AttachedFile, Conversation } from '@/types/conversation';
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
  onOpenDocument: (conversationId: string, file: AttachedFile) => void;
};

function chatLabel(c: Conversation, fallback: string) {
  return c.title.trim() || fallback;
}

function truncateFileName(name: string, max = 28) {
  if (name.length <= max) return name;
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const base = ext ? name.slice(0, name.length - ext.length) : name;
  const keep = Math.max(8, max - ext.length - 1);
  return `${base.slice(0, keep)}…${ext}`;
}

function FileTypeIcon({ file }: { file: AttachedFile }) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const spreadsheet = ['xls', 'xlsx', 'csv'].includes(ext);
  if (spreadsheet) {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand-gradient text-[10px] font-bold text-primary-foreground"
        aria-hidden
      >
        X
      </span>
    );
  }
  if (file.mimeType === 'application/pdf' || ext === 'pdf') {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-destructive text-[9px] font-bold text-destructive-foreground"
        aria-hidden
      >
        PDF
      </span>
    );
  }
  if (ext === 'doc' || ext === 'docx' || file.mimeType.includes('wordprocessingml')) {
    return <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden />;
  }
  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
}

function SidebarNavCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('sidebar-nav-card min-w-0', className)}>{children}</div>;
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
        active ? 'sidebar-nav-item-active' : 'hover:bg-primary/5',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'block w-full truncate py-2 pl-3 pr-3 text-left text-sm transition-[padding]',
          'group-hover:pr-[7.25rem]',
          active ? 'font-medium text-primary' : 'font-medium text-foreground/90',
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
              : 'bg-gradient-to-l from-muted from-55% to-transparent group-hover:from-primary/5',
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
  onOpenDocument,
}: ChatSidebarProps) {
  const { t } = useTranslation();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const open = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const projectsExpanded = useUiStore((s) => s.projectsExpanded);
  const setProjectsExpanded = useUiStore((s) => s.setProjectsExpanded);
  const documentsExpanded = useUiStore((s) => s.documentsExpanded);
  const setDocumentsExpanded = useUiStore((s) => s.setDocumentsExpanded);

  const fallback = t('nav.newChat');
  const pinned = conversations.filter((c) => c.pinned);
  const inProject = conversations.filter((c) => c.inProject && !c.pinned);
  const recent = conversations.filter((c) => !c.pinned && !c.inProject);
  const conversationsWithFiles = conversations.filter((c) => c.files.length > 0);
  const totalDocuments = conversationsWithFiles.reduce((n, c) => n + c.files.length, 0);

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
        'sidebar-shell flex h-full min-w-0 shrink-0 flex-col overflow-x-hidden font-sans transition-[width] duration-200 ease-out',
        width,
      )}
    >
      <div
        className={cn(
          'brand-shell-header sidebar-header-row flex items-center',
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
          'flex min-h-0 flex-1 flex-col gap-2 p-2',
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
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-x-hidden">
            <SidebarNavCard className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <p className="sidebar-section-label">{t('sidebar.general')}</p>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-primary/5',
                  projectsExpanded && 'sidebar-nav-item-active',
                )}
                onClick={() => setProjectsExpanded(!projectsExpanded)}
              >
                <FolderKanban className="ml-0.5 h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-left">{t('sidebar.projects')}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                    projectsExpanded ? 'rotate-0' : '-rotate-90',
                  )}
                />
              </button>
              {projectsExpanded && (
                <div className="sidebar-tree-branch mx-1 mb-1 space-y-0.5">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {t('sidebar.defaultProject')}
                  </p>
                  {inProject.length === 0 && (
                    <p className="px-2 py-1 text-xs text-muted-foreground">{t('sidebar.emptyRecent')}</p>
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

              <div className="sidebar-section-divider" />

              <p className="sidebar-section-label">{t('sidebar.pinned')}</p>
              <div className="space-y-0.5 px-0.5 pb-1">
                {pinned.length === 0 && (
                  <p className="px-2.5 py-1 text-xs text-muted-foreground">{t('sidebar.emptyPinned')}</p>
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

              <div className="sidebar-section-divider" />

              <p className="sidebar-section-label">{t('sidebar.recent')}</p>
              <div className="space-y-0.5 px-0.5 pb-1.5">
                {recent.length === 0 && (
                  <p className="px-2.5 py-1 text-xs text-muted-foreground">{t('sidebar.emptyRecent')}</p>
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
            </SidebarNavCard>

            <SidebarNavCard className="mt-0.5 shrink-0">
              <button
                type="button"
                className="sidebar-documents-header w-full"
                onClick={() => setDocumentsExpanded(!documentsExpanded)}
              >
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 transition-transform',
                    documentsExpanded ? 'rotate-0' : '-rotate-90',
                  )}
                />
                <span className="flex-1 text-left">{t('sidebar.uploadedDocuments')}</span>
                <span className="sidebar-documents-count">{totalDocuments}</span>
              </button>
              {documentsExpanded && (
                <>
                  <div className="sidebar-section-divider mb-1" />
                  <div className="space-y-2 px-1 pb-2">
                    {conversationsWithFiles.length === 0 && (
                      <p className="px-2 py-1 text-xs text-muted-foreground">{t('sidebar.emptyDocuments')}</p>
                    )}
                    {conversationsWithFiles.map((c) => (
                      <div key={c.id} className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onSelect(c.id)}
                          className="w-full truncate px-2 py-0.5 text-left text-xs font-semibold text-foreground/90 hover:text-foreground"
                          title={chatLabel(c, fallback)}
                        >
                          {chatLabel(c, fallback)}
                        </button>
                        <div className="sidebar-tree-branch space-y-0.5">
                          {c.files.map((file) => (
                            <button
                              key={file.id}
                              type="button"
                              onClick={() => {
                                onSelect(c.id);
                                onOpenDocument(c.id, file);
                              }}
                              className="sidebar-tree-item w-full min-w-0 rounded-md pr-1 text-left text-xs text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
                              title={file.name}
                            >
                              <FileTypeIcon file={file} />
                              <span className="min-w-0 flex-1 truncate font-medium">
                                {truncateFileName(file.name)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </SidebarNavCard>
          </div>
        ) : (
          <div className="mt-1 flex w-full flex-col items-center gap-1">
            <CollapsedIconButton title={t('sidebar.projects')} onClick={toggleSidebar}>
              <FolderKanban className="h-4 w-4" />
            </CollapsedIconButton>
            <CollapsedIconButton title={t('sidebar.pinned')} onClick={toggleSidebar}>
              <Pin className="h-4 w-4" />
            </CollapsedIconButton>
            <CollapsedIconButton title={t('sidebar.uploadedDocuments')} onClick={toggleSidebar}>
              <FileSpreadsheet className="h-4 w-4" />
            </CollapsedIconButton>
          </div>
        )}
      </div>
    </aside>
  );
}
