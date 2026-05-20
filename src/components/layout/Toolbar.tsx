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

export default function Toolbar() {
  const { viewMode, setViewMode, toggleLeftPanel, toggleRightPanel, darkMode, toggleDarkMode } = useUIStore();
  const { yamlText, loadSample, setYamlText, syncFromYaml } = useDomainStore();
  const autoLayout = useCanvasStore((s) => s.autoLayout);
  const { fitView } = useReactFlow();

  const handleAutoLayout = () => {
    autoLayout('TB');
    setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 100);
  };

  const handleExport = () => {
    const blob = new Blob([yamlText], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'domain.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setYamlText(text);
        syncFromYaml();
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const viewModes = [
    { mode: 'graph' as const, icon: GitBranch, label: 'Graph' },
    { mode: 'code' as const, icon: Code, label: 'Code' },
    { mode: 'split' as const, icon: Columns2, label: 'Split' },
  ];

  return (
    <div className="h-10 border-b flex items-center px-2 gap-1 shrink-0" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
      <button onClick={toggleLeftPanel} className="p-1.5 rounded hover:bg-accent" title="Toggle Explorer">
        <PanelLeft size={16} />
      </button>

      <div className="flex items-center gap-0.5 mx-2 p-0.5 rounded-md" style={{ background: 'hsl(var(--muted))' }}>
        {viewModes.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === mode
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={label}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {(viewMode === 'graph' || viewMode === 'split') && (
        <button onClick={handleAutoLayout} className="p-1.5 rounded hover:bg-accent" title="Auto-layout graph">
          <AlignVerticalSpaceAround size={16} />
        </button>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button onClick={handleImport} className="p-1.5 rounded hover:bg-accent" title="Import domain.yaml">
          <Upload size={16} />
        </button>
        <button onClick={handleExport} className="p-1.5 rounded hover:bg-accent" title="Export domain.yaml">
          <Download size={16} />
        </button>
        <button onClick={loadSample} className="p-1.5 rounded hover:bg-accent" title="Load sample domain">
          <FileText size={16} />
        </button>
        <button onClick={toggleDarkMode} className="p-1.5 rounded hover:bg-accent" title="Toggle dark mode">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={toggleRightPanel} className="p-1.5 rounded hover:bg-accent" title="Toggle Inspector">
          <PanelRight size={16} />
        </button>
      </div>
    </div>
  );
}
