import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 280;
const HEADER_HEIGHT = 44;
const FIELD_ROW_HEIGHT = 24;
const NODE_PADDING = 16;
const MIN_NODE_HEIGHT = 100;

function getNodeHeight(node: Node): number {
  const data = node.data as { fields?: { name: string }[] } | undefined;
  const fieldCount = data?.fields?.length ?? 0;
  // header + fields + features bar + padding
  return Math.max(MIN_NODE_HEIGHT, HEADER_HEIGHT + fieldCount * FIELD_ROW_HEIGHT + 32 + NODE_PADDING);
}

export function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
    acyclicer: 'greedy',
    ranker: 'network-simplex',
  });

  nodes.forEach((node) => {
    const height = getNodeHeight(node);
    g.setNode(node.id, { width: NODE_WIDTH, height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    const height = getNodeHeight(node);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
