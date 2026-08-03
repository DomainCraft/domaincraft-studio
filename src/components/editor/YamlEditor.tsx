import Editor from '@monaco-editor/react';
import { useDomainStore } from '@/stores/domain-store';
import { useUIStore } from '@/stores/ui-store';
import { useCallback } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  tabSize: 2,
  automaticLayout: true,
};

export default function YamlEditor() {
  const yamlText = useDomainStore(s => s.yamlText);
  const setYamlText = useDomainStore(s => s.setYamlText);
  const syncFromYaml = useDomainStore(s => s.syncFromYaml);
  const darkMode = useUIStore(s => s.darkMode);

  const debouncedSyncFromYaml = useDebouncedCallback(syncFromYaml, 500);

  const handleChange = useCallback((value: string | undefined) => {
    if (!value) return;
    setYamlText(value);
    debouncedSyncFromYaml();
  }, [setYamlText, debouncedSyncFromYaml]);

  return (
    <div className="w-full h-full">
      <Editor
        language="yaml"
        value={yamlText}
        onChange={handleChange}
        theme={darkMode ? 'vs-dark' : 'vs'}
        options={editorOptions}
      />
    </div>
  );
}
