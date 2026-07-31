import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { useDomainStore } from '@/stores/domain-store';
import { useCanvasStore } from '@/stores/canvas-store';
import { useReactFlow } from '@xyflow/react';
import {
  PanelLeft,
  PanelRight,
  GitBranch,
  Code,
  Columns2,
  Download,
  Upload,
  FileText,
  Moon,
  Sun,
  AlignVerticalSpaceAround,
} from 'lucide-react';
import { exportYaml, importYaml } from '@/lib/file-io';
import { getWasmVersion, isWasmReady, onWasmReady } from '@/lib/wasm-loader';
import Button from '@/components/ui/Button';

const viewModes = [
  { mode: 'graph' as const, icon: GitBranch, label: 'Graph' },
  { mode: 'code' as const, icon: Code, label: 'Code' },
  { mode: 'split' as const, icon: Columns2, label: 'Split' },
];

export default function Toolbar() {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const toggleLeftPanel = useUIStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const darkMode = useUIStore((s) => s.darkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const loadSample = useDomainStore((s) => s.loadSample);
  const setYamlText = useDomainStore((s) => s.setYamlText);
  const syncFromYaml = useDomainStore((s) => s.syncFromYaml);
  const autoLayout = useCanvasStore((s) => s.autoLayout);
  const { fitView } = useReactFlow();
  const [wasmVersion, setWasmVersion] = useState<string | null>(() =>
    isWasmReady() ? getWasmVersion() : null,
  );

  useEffect(() => {
    if (wasmVersion) return;
    return onWasmReady(() => setWasmVersion(getWasmVersion()));
  }, [wasmVersion]);

  const handleAutoLayout = () => {
    autoLayout('TB');
    setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 100);
  };

  const handleExport = () => {
    const yamlText = useDomainStore.getState().yamlText;
    exportYaml(yamlText);
  };

  const handleImport = async () => {
    const text = await importYaml();
    if (text) {
      setYamlText(text);
      syncFromYaml();
    }
  };

  return (
    <div className="h-10 border-b border-themed flex items-center px-2 gap-1 shrink-0 bg-themed-card">
      <Button variant="ghost" size="icon" onClick={toggleLeftPanel} title="Toggle Explorer">
        <PanelLeft size={16} />
      </Button>

      <div className="flex items-center gap-0.5 mx-2 p-0.5 rounded-md bg-themed-muted">
        {viewModes.map(({ mode, icon: Icon, label }) => (
          <Button
            key={mode}
            variant="ghost"
            onClick={() => setViewMode(mode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 font-medium ${
              viewMode === mode
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={label}
          >
            <Icon size={14} />
            {label}
          </Button>
        ))}
      </div>

      {(viewMode === 'graph' || viewMode === 'split') && (
        <Button variant="ghost" size="icon" onClick={handleAutoLayout} title="Auto-layout graph">
          <AlignVerticalSpaceAround size={16} />
        </Button>
      )}

      <div className="flex-1" />

      {wasmVersion && (
        <span
          title="Core validator version"
          className="text-xs text-muted-foreground font-mono px-2 select-none"
        >
          {wasmVersion}
        </span>
      )}

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={handleImport} title="Import domain.yaml">
          <Upload size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleExport} title="Export domain.yaml">
          <Download size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={loadSample} title="Load sample domain">
          <FileText size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} title="Toggle dark mode">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleRightPanel} title="Toggle Inspector">
          <PanelRight size={16} />
        </Button>
      </div>
    </div>
  );
}
