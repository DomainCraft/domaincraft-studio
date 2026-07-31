import { create } from 'zustand';
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { EntityDefinition, ParsedField } from '@/types/domain';
import { getLayoutedElements } from '@/lib/layout';
import { buildCanvasElements, entitiesDiffer } from '@/lib/canvas-helpers';

export type ParsedFieldData = ParsedField;

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  lastSyncedEntities: Record<string, EntityDefinition>;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  setSelectedNode: (nodeId: string | null) => void;
  syncFromSchema: (
    entities: Record<string, EntityDefinition>,
    parseField: (name: string, def: string) => ParsedFieldData
  ) => void;
  autoLayout: (direction?: 'TB' | 'LR') => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  lastSyncedEntities: {},

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  setSelectedNode: (nodeId) => {
    const { nodes } = get();
    const needsUpdate = nodes.some((n) => (n.selected ?? false) !== (n.id === nodeId));
    if (!needsUpdate) return;
    const changes = nodes.map((node) => ({
      id: node.id,
      type: 'select' as const,
      selected: node.id === nodeId,
    }));
    set({ nodes: applyNodeChanges(changes, nodes) });
  },

  syncFromSchema: (entities, parseField) => {
    if (!entitiesDiffer(entities, get().lastSyncedEntities)) return;

    const { nodes: existingNodes } = get();
    const existingPositions: Record<string, { x: number; y: number }> = {};
    existingNodes.forEach((node) => {
      existingPositions[node.id] = node.position;
    });

    const { nodes, edges } = buildCanvasElements(entities, parseField, existingPositions);
    set({ nodes, edges, lastSyncedEntities: entities });
  },

  autoLayout: (direction = 'TB') => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, direction);
    set({ nodes: layoutedNodes });
  },
}));
