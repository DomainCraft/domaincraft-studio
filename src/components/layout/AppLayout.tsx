import { ReactFlowProvider } from '@xyflow/react';
import { useUIStore } from '@/stores/ui-store';
import Toolbar from './Toolbar';
import Explorer from '@/components/explorer/Explorer';
import Canvas from '@/components/canvas/Canvas';
import YamlEditor from '@/components/editor/YamlEditor';
import Inspector from '@/components/inspector/Inspector';

export default function AppLayout() {
  const { viewMode, leftPanelOpen, rightPanelOpen } = useUIStore();

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
        <Toolbar />
        <div className="flex flex-1 min-h-0">
          {leftPanelOpen && (
            <div className="w-64 border-r shrink-0 overflow-y-auto scrollbar-thin" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
              <Explorer />
            </div>
          )}

          <div className="flex-1 min-w-0 flex">
            {(viewMode === 'graph' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full`}>
                <Canvas />
              </div>
            )}
            {(viewMode === 'code' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full border-l`} style={{ borderColor: 'hsl(var(--border))' }}>
                <YamlEditor />
              </div>
            )}
          </div>

          {rightPanelOpen && (
            <div className="w-80 border-l shrink-0 overflow-y-auto scrollbar-thin" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
              <Inspector />
            </div>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
