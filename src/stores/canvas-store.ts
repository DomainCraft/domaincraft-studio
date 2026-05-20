import { create } from 'zustand';
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { EntityDefinition } from '@/types/domain';
import { parseFieldDefinition } from '@/lib/yaml-parser';
import { getLayoutedElements } from '@/lib/layout';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  syncFromSchema: (entities: Record<string, EntityDefinition>) => void;
  autoLayout: (direction?: 'TB' | 'LR') => void;
}

function calculateLayout(entityNames: string[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const cols = Math.max(1, Math.ceil(Math.sqrt(entityNames.length)));
  const spacing = { x: 320, y: 280 };

  entityNames.forEach((name, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions[name] = { x: col * spacing.x + 50, y: row * spacing.y + 50 };
  });

  return positions;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  syncFromSchema: (entities) => {
    const { nodes: existingNodes } = get();
    const existingPositions: Record<string, { x: number; y: number }> = {};
    existingNodes.forEach((node) => {
      existingPositions[node.id] = node.position;
    });

    const entityNames = Object.keys(entities);
    const layoutPositions = calculateLayout(entityNames);

    const nodes: Node[] = entityNames.map((name) => {
      const entity = entities[name];
      const fields = Object.entries(entity.fields).map(([fieldName, fieldDef]) => {
        const parsed = parseFieldDefinition(fieldName, fieldDef);
        return parsed;
      });

      const position = existingPositions[name] || layoutPositions[name] || { x: 0, y: 0 };

      return {
        id: name,
        type: 'entity',
        position,
        data: {
          name,
          fields,
          features: entity.features || [],
          permissions: entity.permissions,
        },
      };
    });

    const edges: Edge[] = [];
    entityNames.forEach((name) => {
      const entity = entities[name];
      Object.entries(entity.fields).forEach(([fieldName, fieldDef]) => {
        const parsed = parseFieldDefinition(fieldName, fieldDef);
        if (parsed.type === 'relation' && parsed.target && entities[parsed.target]) {
          edges.push({
            id: `${name}-${fieldName}-${parsed.target}`,
            source: name,
            target: parsed.target,
            type: 'crowFoot',
            animated: false,
            data: {
              sourceCardinality: parsed.validations?.unique === 'true' ? 'one' : 'many',
              targetCardinality: parsed.isArray || parsed.validations?.many === 'true' ? 'many' : 'one',
            },
          });
        }
      });
    });

    set({ nodes, edges });
  },

  autoLayout: (direction = 'TB') => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, direction);
    set({ nodes: layoutedNodes });
  },
}));
