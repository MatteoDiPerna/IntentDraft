import type React from 'react';
import {
  ChevronDown,
  FolderKanban,
  PanelLeftClose,
  Pin,
  PenSquare,
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
};

function chatLabel(c: Conversation, fallback: string) {
  return c.title.trim() || fallback;
}

function ChatListItem({
  active,
  label,
  onSelect,
  collapsed,
}: {
  active: boolean;
  label: string;
  onSelect: () => void;
  collapsed: boolean;
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg px-3 py-2 text-left text-sm truncate transition-colors',
        active ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-muted',
      )}
    >
      {label}
    </button>
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
}: ChatSidebarProps) {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const projectsExpanded = useUiStore((s) => s.projectsExpanded);
  const setProjectsExpanded = useUiStore((s) => s.setProjectsExpanded);

  const fallback = t('nav.newChat');
  const pinned = conversations.filter((c) => c.pinned);
  const inProject = conversations.filter((c) => c.inProject && !c.pinned);
  const recent = conversations.filter((c) => !c.pinned && !c.inProject);

  const width = open ? 'w-[260px]' : 'w-[56px]';

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r bg-muted/30 transition-[width] duration-200 ease-out',
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
          open ? 'overflow-y-auto' : 'overflow-hidden items-center',
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
          <>
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
                  />
                ))}
              </div>
            </div>
          </>
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
