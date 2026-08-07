import { parse } from 'yaml';
import type { DomainSchema, EntityDefinition, AuthConfig, ParsedField } from '@/types/domain';

export function parseFieldDefinitionFallback(name: string, def: string): ParsedField {
  const result: ParsedField = { name, type: '', validations: {} };
  const trimmed = def.trim();
  const bracketContent = extractTrailingBracket(trimmed);
  if (bracketContent !== null && bracketContent.length > 0) {
    const parts = splitModifiers(bracketContent);
    for (const part of parts) {
      const p = part.trim();
      if (!p) continue;
      const colonIdx = p.indexOf(':');
      if (colonIdx > 0) {
        result.validations[p.slice(0, colonIdx).trim()] = p.slice(colonIdx + 1).trim();
      } else {
        result.validations[p] = 'true';
      }
    }
  }
  const typePart = bracketContent !== null ? trimmed.slice(0, trimmed.indexOf('[')).trim() : trimmed;
  const parenMatch = typePart.match(/^(\w+)\(([^)]+)\)$/);
  if (parenMatch && parenMatch[1] && parenMatch[2]) {
    const rawType = parenMatch[1];
    result.target = parenMatch[2];
    if (rawType === 'relation') {
      result.type = 'relation';
    } else if (rawType === 'enum') {
      result.type = 'enum';
    } else if (rawType === 'array') {
      result.type = parenMatch[2];
      result.isArray = true;
    }
  } else {
    result.type = typePart;
  }
  return result;
}

/**
 * Extracts the trailing `[ ... ]` modifier clause (last balanced bracket that
 * closes at the end of the string) and returns its inner content. Returns null
 * when no such clause exists. Bracket-aware so that array default values like
 * `default:[a, b, c]` are not mangled by a regex that stops at the first "]".
 */
function extractTrailingBracket(s: string): string | null {
  if (s[s.length - 1] !== ']') return null;
  let depth = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const c = s[i];
    if (c === ']') {
      depth++;
    } else if (c === '[') {
      depth--;
      if (depth === 0) {
        return s.slice(i + 1, s.length - 1);
      }
    }
  }
  return null;
}

/**
 * Splits a modifier clause on commas while respecting square brackets (array
 * defaults like `[a, b, c]`) and single/double quotes. Mirrors splitModifiers
 * in the core Go lexer so the JS fallback parses exactly like the WASM path.
 */
function splitModifiers(s: string): string[] {
  const out: string[] = [];
  let cur = '';
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote !== null) {
      cur += c;
      if (c === quote) quote = null;
      continue;
    }
    if (c === '\'' || c === '"') {
      quote = c;
      cur += c;
    } else if (c === '[') {
      depth++;
      cur += c;
    } else if (c === ']') {
      if (depth > 0) depth--;
      cur += c;
    } else if (c === ',') {
      if (depth === 0) {
        out.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

export function parseDomainYamlFallback(yamlText: string): DomainSchema {
  const raw = parse(yamlText);
  if (!raw || typeof raw !== 'object') {
    return { project: { name: 'Untitled' }, entities: {} };
  }
  const rawObj = raw as Record<string, unknown>;
  const project = (rawObj.project && typeof rawObj.project === 'object') ? rawObj.project as DomainSchema['project'] : { name: 'Untitled' };
  const entities: Record<string, EntityDefinition> = {};
  const enums: Record<string, string[]> = (rawObj.enums && typeof rawObj.enums === 'object' && !Array.isArray(rawObj.enums)) ? rawObj.enums as Record<string, string[]> : {};
  if (rawObj.entities && typeof rawObj.entities === 'object' && !Array.isArray(rawObj.entities)) {
    for (const [entityName, def] of Object.entries(rawObj.entities as Record<string, unknown>)) {
      if (!def || typeof def !== 'object') continue;
      const entityDef = def as Record<string, unknown>;
      const perms = entityDef.permissions && typeof entityDef.permissions === 'object' ? entityDef.permissions as Record<string, unknown> : undefined;
      const rawFields = entityDef.fields && typeof entityDef.fields === 'object' && !Array.isArray(entityDef.fields) ? entityDef.fields as Record<string, string> : {};
      const rawFeatures = Array.isArray(entityDef.features) ? entityDef.features as EntityDefinition['features'] : [];
      entities[entityName] = {
        old_name: entityDef.old_name as string | undefined,
        fields: rawFields,
        features: rawFeatures,
        permissions: perms ? {
          read: Array.isArray(perms.read) ? perms.read as string[] : undefined,
          create: Array.isArray(perms.create) ? perms.create as string[] : undefined,
          update: Array.isArray(perms.update) ? perms.update as string[] : undefined,
          delete: Array.isArray(perms.delete) ? perms.delete as string[] : undefined,
        } : undefined,
        indexes: entityDef.indexes as EntityDefinition['indexes'],
        seed: entityDef.seed as EntityDefinition['seed'],
      };
    }
  }
  return {
    project,
    database: rawObj.database as DomainSchema['database'],
    auth: parseAuthFallback(rawObj.auth),
    api_style: rawObj.api_style as DomainSchema['api_style'],
    entities,
    enums,
  };
}

function parseAuthFallback(raw: unknown): AuthConfig | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    return { type: raw as 'jwt' | 'none' };
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    return {
      type: (obj.type as 'jwt' | 'none') || 'none',
      entity: obj.entity as string | undefined,
      roles: obj.roles as string[] | undefined,
      endpoints: obj.endpoints as AuthConfig['endpoints'],
    };
  }
  return undefined;
}
