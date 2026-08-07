import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

interface CrowFootData {
  sourceCardinality?: 'one' | 'many';
  targetCardinality?: 'one' | 'many';
}

function CrowFootEdgeInner({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
}: EdgeProps) {
  // Self-referencing relation: source and target handles sit on the same node
  // (bottom source, top target), so a bezier between them collapses to a line
  // behind the node. Draw an explicit loop arcing out to the right instead.
  const isSelfLoop = source === target;
  const edgePath = isSelfLoop
    ? `M ${sourceX} ${sourceY} C ${sourceX + 90} ${sourceY}, ${targetX + 90} ${targetY}, ${targetX} ${targetY}`
    : getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      })[0];

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
