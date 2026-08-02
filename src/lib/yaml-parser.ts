import { stringify } from 'yaml';
import type { DomainSchema, EntityDefinition, ParsedField, AuthConfig } from '@/types/domain';
import { DATABASES, API_STYLES, AUTH_TYPES } from '@/lib/constants';
import {
  wasmParseField,
  wasmParseDomain,
  isWasmReady,
  type WasmParsedField,
  type WasmRawSchema,
} from './wasm-client';
import { parseFieldDefinitionFallback, parseDomainYamlFallback } from './yaml-parser-fallback';

export { parseFieldDefinitionFallback, parseDomainYamlFallback };

const DATABASE_SET = new Set<string>(DATABASES);
const API_STYLE_SET = new Set<string>(API_STYLES);
const AUTH_TYPE_SET = new Set<string>(AUTH_TYPES);

export function wasmFieldToParsed(wf: WasmParsedField, fallbackName: string): ParsedField {
  const validations = { ...wf.Validations };
  if (wf.IsPrimary) validations.primary = 'true';
  if (wf.IsRequired) validations.required = 'true';
  if (wf.IsUnique) validations.unique = 'true';
  if (wf.IsHidden) validations.hidden = 'true';
  if (wf.IsOptional) validations.optional = 'true';
  if (wf.IsMany && wf.Type === 'relation') validations.many = 'true';
  if (wf.OnDelete) {
    validations.on_delete = wf.OnDelete;
  }
  if (wf.DefaultValue) {
    validations.default = wf.DefaultIsFunc ? `${wf.DefaultValue}()` : wf.DefaultValue;
  }
  return {
    name: wf.Name || fallbackName,
    type: wf.Type === 'array' ? (wf.TargetType || 'string') : wf.Type,
    target: wf.TargetEntity || wf.TargetType,
    isArray: wf.Type === 'array' ? true : undefined,
    validations,
  };
}

export function parseFieldDefinition(nameOrDefinition: string, definition?: string): ParsedField {
  const name = definition !== undefined ? nameOrDefinition : '';
  const def = definition !== undefined ? definition : nameOrDefinition;

  if (isWasmReady()) {
    const wf = wasmParseField(def, name);
    if (wf) return wasmFieldToParsed(wf, name);
  }

  return parseFieldDefinitionFallback(name, def);
}

export type ParseDomainResult = { schema: DomainSchema; fieldOrder: Record<string, string[]> };

export function parseDomainYaml(yamlText: string): ParseDomainResult {
  if (isWasmReady()) {
    const ws = wasmParseDomain(yamlText);
    if (ws) return wasmSchemaToDomain(ws);
  }
  const schema = parseDomainYamlFallback(yamlText);
  return { schema, fieldOrder: {} };
}

function wasmSchemaToDomain(ws: WasmRawSchema): ParseDomainResult {
  const auth: AuthConfig | undefined = ws.auth
    ? {
        type: AUTH_TYPE_SET.has(ws.auth.type as AuthConfig['type']) ? (ws.auth.type as AuthConfig['type']) : 'none',
        entity: ws.auth.entity,
        roles: ws.auth.roles,
        endpoints: ws.auth.endpoints,
      }
    : undefined;

  const entities: Record<string, EntityDefinition> = {};
  const fieldOrder: Record<string, string[]> = {};
  for (const [name, entity] of Object.entries(ws.entities)) {
    entities[name] = {
      old_name: entity.old_name,
      fields: entity.fields,
      features: entity.features as EntityDefinition['features'],
      permissions: entity.permissions as EntityDefinition['permissions'],
      indexes: entity.indexes as EntityDefinition['indexes'],
      seed: entity.seed as EntityDefinition['seed'],
    };
    fieldOrder[name] = entity.fieldOrder && entity.fieldOrder.length > 0
      ? entity.fieldOrder
      : Object.keys(entity.fields);
  }

  let apiStyle: DomainSchema['api_style'] | undefined;
  if (ws.apiStyle) {
    if (API_STYLE_SET.has(ws.apiStyle)) {
      apiStyle = ws.apiStyle as DomainSchema['api_style'];
    } else {
      console.warn(`[WASM contract] Unknown apiStyle value: "${ws.apiStyle}". Expected one of: ${API_STYLES.join(', ')}`);
    }
  }

  return {
    schema: {
      project: ws.project as DomainSchema['project'],
      database: ws.database && DATABASE_SET.has(ws.database)
        ? ws.database as DomainSchema['database']
        : undefined,
      auth,
      api_style: apiStyle,
      entities,
      enums: ws.enums || {},
    },
    fieldOrder,
  };
}

export function serializeDomainYaml(schema: DomainSchema, fieldOrder?: Record<string, string[]>): string {
  const raw: Record<string, unknown> = { project: schema.project };
  if (schema.database) raw.database = schema.database;
  if (schema.auth) {
    raw.auth = {
      type: AUTH_TYPE_SET.has(schema.auth.type) ? schema.auth.type : 'none',
      ...(schema.auth.entity && { entity: schema.auth.entity }),
      ...(schema.auth.roles && schema.auth.roles.length > 0 && { roles: schema.auth.roles }),
      ...(schema.auth.endpoints && { endpoints: schema.auth.endpoints }),
    };
  }
  if (schema.api_style && API_STYLE_SET.has(schema.api_style)) raw.api_style = schema.api_style;
  if (schema.enums && Object.keys(schema.enums).length > 0) {
    raw.enums = schema.enums;
  }
  if (Object.keys(schema.entities).length > 0) {
    const entitiesOut: Record<string, Record<string, unknown>> = {};
    for (const [name, def] of Object.entries(schema.entities)) {
      const order = fieldOrder?.[name];
      const fields: Record<string, string> = {};
      if (order) {
        for (const key of order) {
          if (key in def.fields && def.fields[key] !== undefined) fields[key] = def.fields[key]!;
        }
        for (const key of Object.keys(def.fields)) {
          if (!(key in fields) && def.fields[key] !== undefined) fields[key] = def.fields[key]!;
        }
      } else {
        for (const [k, v] of Object.entries(def.fields)) fields[k] = v;
      }
      const entity: Record<string, unknown> = { fields };
      if (def.old_name) entity.old_name = def.old_name;
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

const FIELD_FLAG_MODIFIERS = new Set(['required', 'unique', 'hidden', 'primary', 'optional', 'many', 'email', 'url', 'ipv4']);

export function serializeFieldDefinition(field: ParsedField): string {
  let typePart = field.type;
  if (field.type === 'relation' && field.target) {
    typePart = `relation(${field.target})`;
  } else if (field.type === 'enum' && field.target) {
    typePart = `enum(${field.target})`;
  } else if (field.isArray && field.type !== 'relation') {
    typePart = `array(${field.type})`;
  }
  const validationEntries = Object.entries(field.validations);
  if (validationEntries.length === 0) return typePart;
  const parts = validationEntries.map(([key, value]) => {
    if (FIELD_FLAG_MODIFIERS.has(key) && value === 'true') return key;
    return `${key}:${value}`;
  });
  return `${typePart} [${parts.join(', ')}]`;
}
