import { describe, it, expect, vi } from 'vitest';
import { serializeFieldDefinition, parseFieldDefinition } from '@/lib/yaml-parser';

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

describe('serializeFieldDefinition', () => {
  it('serializes simple string type', () => {
    const result = serializeFieldDefinition({
      name: 'name',
      type: 'string',
      validations: {},
    });
    expect(result).toBe('string');
  });

  it('serializes string with required validation', () => {
    const result = serializeFieldDefinition({
      name: 'email',
      type: 'string',
      validations: { required: 'true' },
    });
    expect(result).toBe('string [required]');
  });

  it('serializes string with multiple validations', () => {
    const result = serializeFieldDefinition({
      name: 'email',
      type: 'string',
      validations: { required: 'true', unique: 'true', email: 'true' },
    });
    expect(result).toBe('string [required, unique, email]');
  });

  it('serializes relation type', () => {
    const result = serializeFieldDefinition({
      name: 'userId',
      type: 'relation',
      target: 'User',
      validations: {},
    });
    expect(result).toBe('relation(User)');
  });

  it('serializes relation with validations', () => {
    const result = serializeFieldDefinition({
      name: 'userId',
      type: 'relation',
      target: 'User',
      validations: { required: 'true' },
    });
    expect(result).toBe('relation(User) [required]');
  });

  it('serializes enum type', () => {
    const result = serializeFieldDefinition({
      name: 'role',
      type: 'enum',
      target: 'UserRole',
      validations: {},
    });
    expect(result).toBe('enum(UserRole)');
  });

  it('serializes array type', () => {
    const result = serializeFieldDefinition({
      name: 'tags',
      type: 'string',
      isArray: true,
      validations: {},
    });
    expect(result).toBe('array(string)');
  });

  it('serializes uuid primary', () => {
    const result = serializeFieldDefinition({
      name: 'id',
      type: 'uuid',
      validations: { primary: 'true' },
    });
    expect(result).toBe('uuid [primary]');
  });

  it('serializes decimal with bounds', () => {
    const result = serializeFieldDefinition({
      name: 'price',
      type: 'decimal',
      validations: { required: 'true', gte: '0' },
    });
    expect(result).toBe('decimal [required, gte:0]');
  });

  it('serializes boolean with default', () => {
    const result = serializeFieldDefinition({
      name: 'isActive',
      type: 'boolean',
      validations: { default: 'true' },
    });
    expect(result).toBe('boolean [default:true]');
  });

  it('round-trips parse -> serialize -> parse', () => {
    const definitions = [
      'string [required, unique, email]',
      'relation(User) [required]',
      'enum(UserRole) [default:Admin]',
      'array(string)',
      'uuid [primary]',
      'decimal [required, gte:0, lte:1000]',
      'boolean [default:true]',
      'text [min:10, max:5000]',
    ];

    for (const def of definitions) {
      const parsed = parseFieldDefinition('testField', def);
      const serialized = serializeFieldDefinition(parsed);
      const reparsed = parseFieldDefinition('testField', serialized);
      expect(reparsed.type).toBe(parsed.type);
      expect(reparsed.target).toBe(parsed.target);
      expect(reparsed.isArray).toBe(parsed.isArray);
      expect(reparsed.validations).toEqual(parsed.validations);
    }
  });
});
