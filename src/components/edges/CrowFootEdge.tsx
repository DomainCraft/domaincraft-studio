import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

interface CrowFootData {
  sourceCardinality?: 'one' | 'many';
  targetCardinality?: 'one' | 'many';
}

const MARKER_DEFS = (
  <defs>
    <marker
      id="crow-foot-one"
      viewBox="0 0 12 16"
      refX="6"
      refY="8"
      markerWidth="10"
      markerHeight="16"
      orient="auto"
    >
      <line
        x1="6"
        y1="0"
        x2="6"
        y2="16"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1.5"
      />
    </marker>
    <marker
      id="crow-foot-many"
      viewBox="0 0 18 16"
      refX="18"
      refY="8"
      markerWidth="14"
      markerHeight="14"
      orient="auto"
    >
      <path
        d="M 18 8 L 8 1 M 18 8 L 8 15 M 0 8 L 18 8"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1.5"
        fill="none"
      />
    </marker>
  </defs>
);

function CrowFootEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const { sourceCardinality = 'one', targetCardinality = 'many' } =
    (data as CrowFootData) || {};

  return (
    <>
      {MARKER_DEFS}
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={`url(#crow-foot-${sourceCardinality})`}
        markerEnd={`url(#crow-foot-${targetCardinality})`}
        style={{ stroke: 'hsl(var(--muted-foreground))', ...style }}
      />
    </>
  );
}

const CrowFootEdge = memo(CrowFootEdgeInner);
export default CrowFootEdge;
