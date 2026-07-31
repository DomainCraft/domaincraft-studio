import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

interface CrowFootData {
  sourceCardinality?: 'one' | 'many';
  targetCardinality?: 'one' | 'many';
}

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

  const crowData = (data ?? {}) as CrowFootData;
  const sourceCardinality = crowData.sourceCardinality ?? 'one';
  const targetCardinality = crowData.targetCardinality ?? 'many';

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerStart={`url(#crow-foot-${sourceCardinality})`}
      markerEnd={`url(#crow-foot-${targetCardinality})`}
      style={{ stroke: 'hsl(var(--muted-foreground))', ...style }}
    />
  );
}

const CrowFootEdge = memo(CrowFootEdgeInner);
export default CrowFootEdge;
