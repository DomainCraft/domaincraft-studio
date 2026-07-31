import type { Node, Edge } from '@xyflow/react';
import type { EntityDefinition } from '@/types/domain';
import type { ParsedFieldData } from '@/stores/canvas-store';

function arraysEqual(a: string[] | undefined, b: string[] | undefined): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function permissionsEqual(
  a: EntityDefinition['permissions'],
  b: EntityDefinition['permissions']
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const keys = ['read', 'create', 'update', 'delete'] as const;
  for (const k of keys) {
    if (!arraysEqual(a[k], b[k])) return false;
  }
  return true;
}

export function buildCanvasElements(
  entities: Record<string, EntityDefinition>,
  parseField: (name: string, def: string) => ParsedFieldData,
  existingPositions: Record<string, { x: number; y: number }>
): { nodes: Node[]; edges: Edge[] } {
  const entityNames = Object.keys(entities);

  const parsedFieldsByEntity: Record<string, ParsedFieldData[]> = {};
  for (const name of entityNames) {
    const entity = entities[name];
    if (!entity) continue;
    parsedFieldsByEntity[name] = Object.entries(entity.fields).map(
      ([fieldName, fieldDef]) => parseField(fieldName, fieldDef)
    );
  }

  const nodes: Node[] = entityNames.map((name) => {
    const position = existingPositions[name] || { x: 0, y: 0 };
    const entity = entities[name];
    const fields = parsedFieldsByEntity[name] ?? [];
    const features = entity?.features ?? [];

    return {
      id: name,
      type: 'entity',
      position,
      data: {
        name,
        fields,
        features,
        permissions: entity?.permissions,
      },
    };
  });

  const edges: Edge[] = [];
  for (const name of entityNames) {
    for (const parsed of parsedFieldsByEntity[name] ?? []) {
      if (parsed.type === 'relation' && parsed.target && entities[parsed.target]) {
        edges.push({
          id: `${name}-${parsed.name}-${parsed.target}`,
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
    }
  }

  return { nodes, edges };
}

export function entitiesDiffer(
  a: Record<string, EntityDefinition>,
  b: Record<string, EntityDefinition>
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return true;
  for (const k of keysA) {
    if (!(k in b)) return true;
    const ea = a[k]!;
    const eb = b[k]!;
    if (Object.keys(ea.fields).length !== Object.keys(eb.fields).length) return true;
    for (const f of Object.keys(ea.fields)) {
      if (ea.fields[f] !== eb.fields[f]) return true;
    }
    if (!arraysEqual(ea.features, eb.features)) return true;
    if (!permissionsEqual(ea.permissions, eb.permissions)) return true;
  }
  return false;
}
