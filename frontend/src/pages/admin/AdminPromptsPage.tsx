import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassPanel } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { usePorts } from '@/providers/PortsProvider';
import type { AdminPromptTemplateGroup } from '@/types/admin';

export function AdminPromptsPage() {
  const { t } = useTranslation();
  const ports = usePorts();
  const showError = useApiErrorToast();
  const [groups, setGroups] = useState<AdminPromptTemplateGroup[]>([]);
  const [selectedKey, setSelectedKey] = useState('analyze_system');
  const [body, setBody] = useState('');
  const [dryRunText, setDryRunText] = useState('');
  const [dryRunOut, setDryRunOut] = useState('');
  const [dryRunIntent, setDryRunIntent] = useState('');

  const load = async () => {
    try {
      const res = await ports.admin.listPromptTemplates();
      setGroups(res.groups);
      const g = res.groups.find((x) => x.key === selectedKey);
      setBody(g?.active?.body ?? '');
    } catch (e) {
      showError(e);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const g = groups.find((x) => x.key === selectedKey);
    setBody(g?.active?.body ?? '');
  }, [selectedKey, groups]);

  const onSave = async () => {
    try {
      await ports.admin.putPromptTemplate(selectedKey, { provider: 'anthropic', body, activate: true });
      await load();
    } catch (e) {
      showError(e);
    }
  };

  const onDryRun = async () => {
    try {
      const res = await ports.admin.dryRunPrompt({ userText: dryRunText, locale: 'it' });
      setDryRunOut(res.promptMarkdown);
      setDryRunIntent(
        res.intentModel ? JSON.stringify(res.intentModel, null, 2) : '',
      );
    } catch (e) {
      showError(e);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GlassPanel className="space-y-3 p-4">
        <Label htmlFor="tplKey">{t('admin.prompts.key')}</Label>
        <select
          id="tplKey"
          className="brand-field w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
        >
          <option value="analyze_system">analyze_system</option>
          <option value="generate_system">generate_system</option>
        </select>
        <textarea
          className="brand-field min-h-[240px] w-full rounded-md border bg-background p-3 font-mono text-xs"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="button" size="sm" onClick={() => void onSave()}>
          {t('admin.prompts.save')}
        </Button>
      </GlassPanel>
      <GlassPanel className="space-y-3 p-4">
        <Label htmlFor="dry">{t('admin.prompts.dryRunInput')}</Label>
        <Input id="dry" className="brand-field" value={dryRunText} onChange={(e) => setDryRunText(e.target.value)} />
        <Button type="button" size="sm" variant="outline" onClick={() => void onDryRun()}>
          {t('admin.prompts.dryRun')}
        </Button>
        {dryRunIntent ? (
          <>
            <p className="text-xs font-medium text-muted-foreground">{t('admin.prompts.intentJson')}</p>
            <textarea
              readOnly
              className="brand-field min-h-[120px] w-full rounded-md border bg-muted/30 p-3 font-mono text-xs"
              value={dryRunIntent}
            />
          </>
        ) : null}
        <p className="text-xs font-medium text-muted-foreground">{t('admin.prompts.promptMarkdown')}</p>
        <textarea
          readOnly
          className="brand-field min-h-[240px] w-full rounded-md border bg-muted/30 p-3 font-mono text-xs"
          value={dryRunOut}
        />
      </GlassPanel>
    </div>
  );
}
