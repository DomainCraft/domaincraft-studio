import { lazy, Suspense } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useUIStore } from '@/stores/ui-store';
import Toolbar from './Toolbar';
import Explorer from '@/components/explorer/Explorer';
import Inspector from '@/components/inspector/Inspector';
import Canvas from '@/components/canvas/Canvas';
import ValidationErrors from './ValidationErrors';

const YamlEditor = lazy(() => import('@/components/editor/YamlEditor'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
    </div>
  );
}

export default function AppLayout() {
  const viewMode = useUIStore((s) => s.viewMode);
  const leftPanelOpen = useUIStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        <Toolbar />
        <div className="flex flex-1 min-h-0">
          {leftPanelOpen && (
            <div className="w-64 border-r border-themed shrink-0 overflow-y-auto scrollbar-thin bg-themed-card hover:bg-accent/5 transition-colors">
              <Explorer />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 min-h-0 flex">
              {(viewMode === 'graph' || viewMode === 'split') && (
                <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full`}>
                  <Canvas />
                </div>
              )}
              {(viewMode === 'code' || viewMode === 'split') && (
                <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full border-l border-themed`}>
                  <Suspense fallback={<LoadingFallback />}>
                    <YamlEditor />
                  </Suspense>
                </div>
              )}
            </div>
            <ValidationErrors />
          </div>

          {rightPanelOpen && (
            <div className="w-80 border-l border-themed shrink-0 overflow-y-auto scrollbar-thin bg-themed-card hover:bg-accent/5 transition-colors">
              <Inspector />
            </div>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
