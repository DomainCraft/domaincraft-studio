import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import EntityNode from './EntityNode';
import { edgeTypes, CrowFootMarkerDefs } from '@/components/edges/edge-types';
import { useCanvasStore } from '@/stores/canvas-store';
import { useDomainStore } from '@/stores/domain-store';
import { useUIStore } from '@/stores/ui-store';
import { useCallback, useEffect, useRef } from 'react';
import { parseFieldDefinition } from '@/lib/yaml-parser';

const nodeTypes = { entity: EntityNode };

export default function Canvas() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const syncFromSchema = useCanvasStore((s) => s.syncFromSchema);
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);
  const layoutRevision = useCanvasStore((s) => s.layoutRevision);
  const { fitView } = useReactFlow();
  const schemaVersion = useDomainStore((s) => s.schemaVersion);
  const entities = useDomainStore((s) => s.schema.entities);
  const selectEntity = useDomainStore((s) => s.selectEntity);
  const selectedEntity = useDomainStore((s) => s.selectedEntity);
  const darkMode = useUIStore((s) => s.darkMode);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const prevVersionRef = useRef(schemaVersion);
  const fitRef = useRef(layoutRevision);

  useEffect(() => {
    if (schemaVersion !== prevVersionRef.current) {
      prevVersionRef.current = schemaVersion;
      syncFromSchema(entities, parseFieldDefinition);
    }
  }, [schemaVersion, entities, syncFromSchema]);

  // Refit whenever the graph is laid out fresh (sample import / auto-layout),
  // so newly-placed nodes are actually in view instead of hanging off-screen.
  useEffect(() => {
    if (layoutRevision !== fitRef.current && nodes.length > 0) {
      fitRef.current = layoutRevision;
      fitView({ padding: 0.2, duration: 300 });
    }
  }, [layoutRevision, nodes.length, fitView]);

  useEffect(() => {
    setSelectedNode(selectedEntity);
  }, [selectedEntity, nodes, setSelectedNode]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: { data: Record<string, unknown> }) => {
    const name = node.data.name;
    if (typeof name === 'string') {
      selectEntity(name);
      setActiveTab('entities');
    }
  }, [selectEntity, setActiveTab]);

  const onPaneClick = useCallback(() => {
    selectEntity(null);
  }, [selectEntity]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
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
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          {CrowFootMarkerDefs}
        </svg>
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
