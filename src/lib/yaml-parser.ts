import { parse, stringify } from 'yaml';
import type { DomainSchema, EntityDefinition, ParsedField } from '@/types/domain';

export function parseFieldDefinition(nameOrDefinition: string, definition?: string): ParsedField {
  const name = definition !== undefined ? nameOrDefinition : '';
  const def = definition !== undefined ? definition : nameOrDefinition;
  const result: ParsedField = { name, type: '', validations: {} };
  const trimmed = def.trim();
  const bracketMatch = trimmed.match(/\[([^\]]*)\]\s*$/);
  if (bracketMatch) {
    const parts = bracketMatch[1].split(',').map(p => p.trim());
    for (const part of parts) {
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0) {
        result.validations[part.slice(0, colonIdx).trim()] = part.slice(colonIdx + 1).trim();
      } else {
        result.validations[part] = 'true';
      }
    }
  }
  const typePart = bracketMatch ? trimmed.slice(0, trimmed.indexOf('[')).trim() : trimmed;
  const parenMatch = typePart.match(/^(\w+)\(([^)]+)\)$/);
  if (parenMatch) {
    const rawType = parenMatch[1];
    result.target = parenMatch[2];
    if (rawType === 'relation') {
      result.type = 'relation';
    } else if (rawType === 'enum') {
      result.type = 'enum';
      result.target = parenMatch[2];
    } else if (rawType === 'array') {
      result.type = parenMatch[2];
      result.isArray = true;
    }
  } else {
    result.type = typePart;
  }
  return result;
}

export function parseDomainYaml(yamlText: string): DomainSchema {
  const raw = parse(yamlText);
  if (!raw || typeof raw !== 'object') {
    return { project: { name: 'Untitled' }, entities: {} };
  }
  const project = raw.project || { name: 'Untitled' };
  const entities: Record<string, EntityDefinition> = {};
  const enums: Record<string, string[]> = raw.enums || {};
  if (raw.entities && typeof raw.entities === 'object') {
    for (const [name, def] of Object.entries(raw.entities as Record<string, Record<string, unknown>>)) {
      const entityDef = def as Record<string, unknown>;
      const perms = entityDef.permissions as Record<string, unknown> | undefined;
      entities[name] = {
        fields: (entityDef.fields || {}) as Record<string, string>,
        features: (entityDef.features || []) as EntityDefinition['features'],
        permissions: perms ? {
          read: perms.read as string[] | undefined,
          create: perms.create as string[] | undefined,
          update: perms.update as string[] | undefined,
          delete: perms.delete as string[] | undefined,
          read_public: perms.read_public as string | undefined,
        } : undefined,
        indexes: entityDef.indexes as EntityDefinition['indexes'],
        seed: entityDef.seed as EntityDefinition['seed'],
      };
    }
  }
  // Safeguard: auth might be an object in some YAML files, convert to string
  let auth: string | undefined;
  if (typeof raw.auth === 'string') {
    auth = raw.auth;
  } else if (raw.auth && typeof raw.auth === 'object') {
    auth = (raw.auth as Record<string, unknown>).type as string || JSON.stringify(raw.auth);
  }

  return {
    project,
    database: raw.database as DomainSchema['database'],
    auth,
    api_style: raw.api_style as DomainSchema['api_style'],
    entities,
    enums,
  };
}

export function serializeDomainYaml(schema: DomainSchema): string {
  const raw: Record<string, unknown> = { project: schema.project };
  if (schema.database) raw.database = schema.database;
  if (schema.auth) raw.auth = schema.auth;
  if (schema.api_style) raw.api_style = schema.api_style;
  if (schema.enums && Object.keys(schema.enums).length > 0) {
    raw.enums = schema.enums;
  }
  if (Object.keys(schema.entities).length > 0) {
    const entitiesOut: Record<string, Record<string, unknown>> = {};
    for (const [name, def] of Object.entries(schema.entities)) {
      const entity: Record<string, unknown> = { fields: def.fields };
      if (def.features && def.features.length > 0) entity.features = def.features;
      if (def.permissions) entity.permissions = def.permissions;
      if (def.indexes && def.indexes.length > 0) entity.indexes = def.indexes;
      if (def.seed && def.seed.length > 0) entity.seed = def.seed;
      entitiesOut[name] = entity;
    }
    raw.entities = entitiesOut;
  }
  return stringify(raw, { indent: 2 });
}

export function serializeFieldDefinition(field: ParsedField): string {
  let typePart = field.type;
  if (field.type === 'relation' && field.target) {
    typePart = `relation(${field.target})`;
  } else if (field.type === 'enum' && field.target) {
    typePart = `enum(${field.target})`;
  } else if (field.isArray && field.target) {
    typePart = `array(${field.target})`;
  }

  const validationEntries = Object.entries(field.validations);
  if (validationEntries.length === 0) return typePart;

  const parts = validationEntries.map(([key, value]) => {
    if (value === 'true') return key;
    return `${key}:${value}`;
  });

  return `${typePart} [${parts.join(', ')}]`;
}

export function findRelations(entities: Record<string, EntityDefinition>): Array<{ source: string; target: string; field: string }> {
  const relations: Array<{ source: string; target: string; field: string }> = [];
  for (const [entityName, entity] of Object.entries(entities)) {
    for (const [fieldName, fieldDef] of Object.entries(entity.fields)) {
      const parsed = parseFieldDefinition(fieldName, fieldDef);
      if (parsed.type === 'relation' && parsed.target) {
        relations.push({ source: entityName, target: parsed.target, field: fieldName });
      }
    }
  }
  return relations;
}
