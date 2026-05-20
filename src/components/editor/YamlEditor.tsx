import Editor from '@monaco-editor/react';
import { useDomainStore } from '@/stores/domain-store';
import { useUIStore } from '@/stores/ui-store';
import { useCallback, useRef } from 'react';

export default function YamlEditor() {
  const yamlText = useDomainStore(s => s.yamlText);
  const setYamlText = useDomainStore(s => s.setYamlText);
  const syncFromYaml = useDomainStore(s => s.syncFromYaml);
  const darkMode = useUIStore(s => s.darkMode);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((value: string | undefined) => {
    if (!value) return;
    setYamlText(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      syncFromYaml();
    }, 500);
  }, [setYamlText, syncFromYaml]);

  return (
    <div className="w-full h-full">
      <Editor
        language="yaml"
        value={yamlText}
        onChange={handleChange}
        theme={darkMode ? 'vs-dark' : 'vs'}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
