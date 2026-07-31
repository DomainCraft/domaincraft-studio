import { describe, it, expect, vi } from 'vitest';
import {
  wasmFieldToParsed,
  serializeFieldDefinition,
  parseFieldDefinition,
} from '@/lib/yaml-parser';
import { parseFieldDefinitionFallback, parseDomainYamlFallback } from '@/lib/yaml-parser-fallback';
import type { WasmParsedField } from '@/lib/wasm-client';

vi.mock('@/lib/wasm-loader', () => ({
  isWasmReady: () => false,
  loadWasmValidator: () => Promise.resolve(false),
  onWasmReady: () => () => {},
}));

vi.mock('@/lib/wasm-client', () => ({
  isWasmReady: () => false,
  wasmParseField: () => null,
  wasmParseDomain: () => null,
  wasmValidate: () => null,
}));

function toWasmField(def: string, name: string): WasmParsedField {
  const fallback = parseFieldDefinitionFallback(name, def);
  const rawDefault = fallback.validations.default;
  const isFunc = !!rawDefault?.endsWith('()');
  return {
    Name: name,
    Type: fallback.type === 'relation'
      ? 'relation'
      : fallback.type === 'enum'
        ? 'enum'
        : fallback.isArray && fallback.type !== 'relation' ? 'array' : fallback.type,
    TargetEntity: fallback.type === 'relation' ? fallback.target : undefined,
    TargetType: fallback.type === 'enum' || (fallback.isArray && fallback.type !== 'relation') ? fallback.target : undefined,
    IsPrimary: fallback.validations.primary === 'true',
    IsOptional: fallback.validations.optional === 'true',
    IsUnique: fallback.validations.unique === 'true',
    IsHidden: fallback.validations.hidden === 'true',
    IsRequired: fallback.validations.required === 'true',
    IsMany: fallback.validations.many === 'true',
    OnDelete: fallback.validations.on_delete,
    Validations: Object.fromEntries(
      Object.entries(fallback.validations).filter(([k]) => !['primary', 'optional', 'unique', 'hidden', 'required', 'many', 'on_delete', 'default'].includes(k))
    ),
    DefaultValue: isFunc ? rawDefault?.slice(0, -2) : rawDefault,
    DefaultIsFunc: isFunc,
  };
}

const FIELD_CASES: Array<{ def: string; name: string }> = [
  { name: 'name', def: 'string' },
  { name: 'email', def: 'string [required, unique, email]' },
  { name: 'userId', def: 'relation(User)' },
  { name: 'role', def: 'enum(UserRole)' },
  { name: 'tags', def: 'array(string)' },
  { name: 'userId', def: 'relation(User) [required]' },
  { name: 'price', def: 'decimal [required, gte:0]' },
  { name: 'id', def: 'uuid [primary]' },
  { name: 'userId', def: 'relation(User) [on_delete:cascade]' },
  { name: 'userId', def: 'relation(User) [on_delete:set_null, optional]' },
  { name: 'isActive', def: 'boolean [default:true]' },
  { name: 'createdAt', def: 'datetime [default:now()]' },
  { name: 'roles', def: 'array(string) [required]' },
];

describe('WASM fallback parity', () => {
  describe('wasmFieldToParsed matches fallback parser (Go contract)', () => {
    it.each(FIELD_CASES)('parses "$def" identically via WASM contract and fallback', ({ def, name }) => {
      const wasmField = toWasmField(def, name);
      const viaWasm = wasmFieldToParsed(wasmField, name);
      const viaFallback = parseFieldDefinitionFallback(name, def);
      expect(viaWasm).toEqual(viaFallback);
    });

    it('transfers boolean flags from Go FieldDefinition', () => {
      const viaWasm = wasmFieldToParsed({
        Name: 'id',
        Type: 'uuid',
        IsPrimary: true,
        IsOptional: false,
        IsUnique: true,
        IsHidden: false,
        IsRequired: false,
        IsMany: false,
        Validations: {},
        DefaultIsFunc: false,
      }, 'id');
      expect(viaWasm.validations).toEqual({ primary: 'true', unique: 'true' });
    });

    it('transfers on_delete from Go FieldDefinition', () => {
      const viaWasm = wasmFieldToParsed({
        Name: 'userId',
        Type: 'relation',
        TargetEntity: 'User',
        IsPrimary: false,
        IsOptional: true,
        IsUnique: false,
        IsHidden: false,
        IsRequired: false,
        IsMany: false,
        OnDelete: 'set_null',
        Validations: {},
        DefaultIsFunc: false,
      }, 'userId');
      expect(viaWasm.validations).toEqual({ on_delete: 'set_null', optional: 'true' });
    });

    it('transfers default value and function defaults', () => {
      const literal = wasmFieldToParsed({
        Name: 'isActive', Type: 'boolean', IsPrimary: false, IsOptional: false,
        IsUnique: false, IsHidden: false, IsRequired: false, IsMany: false,
        Validations: {}, DefaultValue: 'true', DefaultIsFunc: false,
      }, 'isActive');
      expect(literal.validations.default).toBe('true');

      const func = wasmFieldToParsed({
        Name: 'createdAt', Type: 'datetime', IsPrimary: false, IsOptional: false,
        IsUnique: false, IsHidden: false, IsRequired: false, IsMany: false,
        Validations: {}, DefaultValue: 'now', DefaultIsFunc: true,
      }, 'createdAt');
      expect(func.validations.default).toBe('now()');
    });

    it('round-trips WASM contract -> GUI -> serializeFieldDefinition', () => {
      for (const { def, name } of FIELD_CASES) {
        const wasmField = toWasmField(def, name);
        const viaWasm = wasmFieldToParsed(wasmField, name);
        const serialized = serializeFieldDefinition(viaWasm);
        const reparsed = parseFieldDefinitionFallback(name, serialized);
        expect(reparsed.type).toBe(viaWasm.type);
        expect(reparsed.target).toBe(viaWasm.target);
        expect(reparsed.isArray).toBe(viaWasm.isArray);
        expect(reparsed.validations).toEqual(viaWasm.validations);
      }
    });
  });

  describe('parseFieldDefinitionFallback', () => {
    it('parses simple string type', () => {
      const result = parseFieldDefinitionFallback('name', 'string');
      expect(result).toEqual({
        name: 'name',
        type: 'string',
        validations: {},
      });
    });

    it('parses string with validations', () => {
      const result = parseFieldDefinitionFallback('email', 'string [required, unique, email]');
      expect(result).toEqual({
        name: 'email',
        type: 'string',
        validations: { required: 'true', unique: 'true', email: 'true' },
      });
    });

    it('parses relation type', () => {
      const result = parseFieldDefinitionFallback('userId', 'relation(User)');
      expect(result).toEqual({
        name: 'userId',
        type: 'relation',
        target: 'User',
        validations: {},
      });
    });

    it('parses enum type', () => {
      const result = parseFieldDefinitionFallback('role', 'enum(UserRole)');
      expect(result).toEqual({
        name: 'role',
        type: 'enum',
        target: 'UserRole',
        validations: {},
      });
    });

    it('parses array type', () => {
      const result = parseFieldDefinitionFallback('tags', 'array(string)');
      expect(result).toEqual({
        name: 'tags',
        type: 'string',
        target: 'string',
        isArray: true,
        validations: {},
      });
    });

    it('parses relation with validations', () => {
      const result = parseFieldDefinitionFallback('userId', 'relation(User) [required]');
      expect(result).toEqual({
        name: 'userId',
        type: 'relation',
        target: 'User',
        validations: { required: 'true' },
      });
    });

    it('parses numeric type with bounds', () => {
      const result = parseFieldDefinitionFallback('price', 'decimal [required, gte:0]');
      expect(result).toEqual({
        name: 'price',
        type: 'decimal',
        validations: { required: 'true', gte: '0' },
      });
    });

    it('parses uuid primary', () => {
      const result = parseFieldDefinitionFallback('id', 'uuid [primary]');
      expect(result).toEqual({
        name: 'id',
        type: 'uuid',
        validations: { primary: 'true' },
      });
    });
  });

  describe('parseDomainYamlFallback', () => {
    it('parses minimal valid YAML', () => {
      const yaml = `
project:
  name: TestApp
entities:
  User:
    fields:
      id: uuid [primary]
      name: string
`;
      const result = parseDomainYamlFallback(yaml);
      expect(result.project.name).toBe('TestApp');
      expect(result.entities['User']?.fields).toBeDefined();
    });

    it('parses YAML with auth', () => {
      const yaml = `
project:
  name: TestApp
auth:
  type: jwt
  entity: User
  roles: [Admin, User]
entities:
  User:
    fields:
      id: uuid [primary]
`;
      const result = parseDomainYamlFallback(yaml);
      expect(result.auth?.type).toBe('jwt');
      expect(result.auth?.entity).toBe('User');
      expect(result.auth?.roles).toEqual(['Admin', 'User']);
    });

    it('parses YAML with enums', () => {
      const yaml = `
project:
  name: TestApp
enums:
  Status:
    - Active
    - Inactive
entities:
  User:
    fields:
      id: uuid [primary]
`;
      const result = parseDomainYamlFallback(yaml);
      expect(result.enums?.Status).toEqual(['Active', 'Inactive']);
    });

    it('handles empty YAML gracefully', () => {
      const result = parseDomainYamlFallback('');
      expect(result.project.name).toBe('Untitled');
      expect(Object.keys(result.entities)).toHaveLength(0);
    });

    it('handles malformed YAML gracefully', () => {
      const result = parseDomainYamlFallback('{{invalid yaml}}');
      expect(result.project.name).toBe('Untitled');
    });
  });

  describe('parseFieldDefinition dispatches to fallback when WASM unavailable', () => {
    it('returns the same result as the fallback parser', () => {
      for (const { def, name } of FIELD_CASES) {
        const parsed = parseFieldDefinition(name, def);
        expect(parsed).toEqual(parseFieldDefinitionFallback(name, def));
      }
    });
  });
});
