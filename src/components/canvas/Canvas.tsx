import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import EntityNode from './EntityNode';
import { edgeTypes } from '@/components/edges/edge-types';
import { useCanvasStore } from '@/stores/canvas-store';
import { useDomainStore } from '@/stores/domain-store';
import { useUIStore } from '@/stores/ui-store';
import { useCallback, useEffect } from 'react';

const nodeTypes = { entity: EntityNode };

export default function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useCanvasStore();
  const schema = useDomainStore(s => s.schema);
  const syncFromSchema = useCanvasStore(s => s.syncFromSchema);
  const selectEntity = useDomainStore(s => s.selectEntity);
  const selectedEntity = useDomainStore(s => s.selectedEntity);
  const darkMode = useUIStore(s => s.darkMode);
  const setActiveTab = useUIStore(s => s.setActiveTab);

  useEffect(() => {
    syncFromSchema(schema.entities);
  }, [schema, syncFromSchema]);

  // Pass selectedEntity through node data for reliable highlight
  const nodesWithSelection = nodes.map(n => ({
    ...n,
    selected: n.id === selectedEntity,
    data: { ...n.data, selectedEntity },
  }));

  const onNodeClick = useCallback((_: React.MouseEvent, node: { data: Record<string, unknown> }) => {
    selectEntity(node.data.name as string);
    setActiveTab('entities');
  }, [selectEntity, setActiveTab]);

  const onPaneClick = useCallback(() => {
    selectEntity(null);
  }, [selectEntity]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        panActivationKeyCode={null}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color={darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}
        />
        <Controls />
        <MiniMap
          nodeColor={darkMode ? '#374151' : '#e5e7eb'}
          maskColor={darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}
          style={{ background: darkMode ? '#1f2937' : '#f9fafb' }}
        />
      </ReactFlow>
    </div>
  );
}
