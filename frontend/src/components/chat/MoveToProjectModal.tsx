import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AppDialog } from '@/components/ui/AppDialog';
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

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={t('sidebar.moveToProject')}
      description={t('sidebar.moveToProjectHint')}
      layer="above"
      footer={
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          {t('chat.cancel')}
        </Button>
      }
    >
      <ul className="max-h-48 space-y-1 overflow-y-auto">
        {projects.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
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
      {currentProjectId ? (
        <Button type="button" variant="ghost" size="sm" className="mt-3 w-full" onClick={onRemoveFromProject}>
          {t('sidebar.removeFromProject')}
        </Button>
      ) : null}
    </AppDialog>
  );
}
