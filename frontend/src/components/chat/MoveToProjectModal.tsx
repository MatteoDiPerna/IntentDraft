import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { ProjectFolder } from '@/store/projectStore';
import { cn } from '@/utils/cn';

type MoveToProjectModalProps = {
  open: boolean;
  projects: ProjectFolder[];
  currentProjectId: string | null;
  onSelect: (projectId: string) => void;
  onRemoveFromProject: () => void;
  onClose: () => void;
};

export function MoveToProjectModal({
  open,
  projects,
  currentProjectId,
  onSelect,
  onRemoveFromProject,
  onClose,
}: MoveToProjectModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-labelledby="move-project-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-lg border bg-popover p-4 shadow-lg">
        <h2 id="move-project-title" className="text-sm font-semibold">
          {t('sidebar.moveToProject')}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{t('sidebar.moveToProjectHint')}</p>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={cn(
                  'w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                  currentProjectId === p.id && 'bg-primary/10 font-medium text-primary',
                )}
                onClick={() => {
                  onSelect(p.id);
                  onClose();
                }}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
        {currentProjectId && (
          <Button type="button" variant="ghost" size="sm" className="mt-3 w-full" onClick={onRemoveFromProject}>
            {t('sidebar.removeFromProject')}
          </Button>
        )}
        <Button type="button" variant="secondary" size="sm" className="mt-2 w-full" onClick={onClose}>
          {t('chat.cancel')}
        </Button>
      </div>
    </div>
  );
}
