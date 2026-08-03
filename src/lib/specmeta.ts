// Runtime specmeta for the Studio.
//
// The authoritative source is the WASM binary (goSpecmeta, built from
// DomainCraft/internal/specmeta/specmeta_json.go). It is loaded once at boot in
// App.tsx: the app shows a splash until the WASM backend is ready, so all reads
// of SPECMETA during first render already see the authoritative values.
//
// Patching a new list into the core is just "rebuild the WASM binary" — no
// source edits, no generation step, nothing else to ship.
//
// BASELINE is a frozen, deliberately-not-regenerated copy used only when the
// WASM backend is unavailable (load failure, CSP, unit tests). Do not keep it
// in sync by hand; it only needs to be close enough for the degraded mode.

import { isWasmReady } from './wasm-loader';

export interface FeatureFieldDef {
  feature: string;
  type: string;
  dbColumn: string;
  isOptional: boolean;
  isFuncDefault: boolean;
  defaultValue: string;
}

/** Contract of the goSpecmeta JSON payload (SpecmetaJSON in the core). */
export interface Specmeta {
  primitiveFieldTypes: readonly string[];
  stringFieldTypes: readonly string[];
  numericFieldTypes: readonly string[];
  onDeleteValues: readonly string[];
  features: readonly string[];
  addons: readonly string[];
  indexTypes: readonly string[];
  databases: readonly string[];
  apiStyles: readonly string[];
  authTypes: readonly string[];
  cacheProviders: readonly string[];
  multiTenancyModes: readonly string[];
  rateLimitPolicies: readonly string[];
  permissionKeys: readonly string[];
  sortDirections: readonly string[];
  stringValidationModifiers: readonly string[];
  numericValidationModifiers: readonly string[];
  infraQueues: readonly string[];
  infraCacheStores: readonly string[];
  infraSecretStores: readonly string[];
  infraStores: readonly string[];
  featureFieldDefs: Readonly<Record<string, FeatureFieldDef>>;
}

const BASELINE: Specmeta = {
  primitiveFieldTypes: ['string', 'text', 'int', 'bigint', 'float', 'decimal', 'boolean', 'date', 'datetime', 'uuid', 'json', 'jsonb'],
  stringFieldTypes: ['string', 'text'],
  numericFieldTypes: ['int', 'bigint', 'float', 'decimal'],
  onDeleteValues: ['cascade', 'set_null', 'restrict', 'no_action'],
  features: ['audit', 'audit_log', 'soft_delete', 'optimistic_lock', 'event_sourced', 'cacheable'],
  addons: ['dapr', 'observability'],
  indexTypes: ['btree', 'hash', 'gist', 'gin', 'brin'],
  databases: ['postgresql', 'mysql', 'sqlite', 'mssql', 'mongodb'],
  apiStyles: ['rest', 'graphql', 'grpc'],
  authTypes: ['jwt', 'none'],
  cacheProviders: ['redis', 'memcached', 'in-memory'],
  multiTenancyModes: ['column', 'schema', 'database'],
  rateLimitPolicies: ['fixed', 'sliding'],
  permissionKeys: ['read', 'create', 'update', 'delete'],
  sortDirections: ['asc', 'desc'],
  stringValidationModifiers: ['min', 'max', 'email', 'url', 'ipv4', 'regex'],
  numericValidationModifiers: ['gte', 'gt', 'lte', 'lt'],
  infraQueues: ['pubsub', 'rabbitmq', 'kafka', 'redis', 'nats', 'in-memory'],
  infraCacheStores: ['redis', 'memcached', 'in-memory'],
  infraSecretStores: ['local', 'kubernetes', 'azure-keyvault', 'aws-secrets'],
  infraStores: ['local', 's3', 'azure-blob', 'gcs'],
  featureFieldDefs: {
    createdAt: { feature: 'audit', type: 'datetime', dbColumn: 'created_at', isOptional: false, isFuncDefault: true, defaultValue: 'now' },
    updatedAt: { feature: 'audit', type: 'datetime', dbColumn: 'updated_at', isOptional: false, isFuncDefault: true, defaultValue: 'now' },
    createdBy: { feature: 'audit_log', type: 'uuid', dbColumn: 'created_by', isOptional: false, isFuncDefault: false, defaultValue: '' },
    updatedBy: { feature: 'audit_log', type: 'uuid', dbColumn: 'updated_by', isOptional: false, isFuncDefault: false, defaultValue: '' },
    deletedAt: { feature: 'soft_delete', type: 'datetime', dbColumn: 'deleted_at', isOptional: true, isFuncDefault: false, defaultValue: '' },
    version: { feature: 'optimistic_lock', type: 'int', dbColumn: 'version', isOptional: false, isFuncDefault: false, defaultValue: '0' },
  },
};

/** Live specmeta. Consumers read fields off this object at render/parse time. */
export const SPECMETA: Specmeta = { ...BASELINE };

// Replaces the live object's fields from the WASM backend. Returns true when
// authoritative data was applied.
export function loadSpecmetaFromWasm(): boolean {
  if (!isWasmReady()) return false;
  const raw = window.goSpecmeta?.();
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!isRecord(data) || !isStringArray(data.primitiveFieldTypes) || !isStringArray(data.features)) {
      console.error('WASM goSpecmeta: malformed payload', data);
      return false;
    }
    Object.assign(SPECMETA, data);
    return true;
  } catch (e) {
    console.error('WASM goSpecmeta failed:', e);
    return false;
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

// Format validators are the string validation modifiers surfaced as toggle
// buttons. Which of them exist is controlled by the core's
// StringValidationModifiers.
const FORMAT_VALIDATION_MODIFIERS = ['email', 'url', 'ipv4'] as const;

export function getFormatValidators(): readonly string[] {
  return SPECMETA.stringValidationModifiers.filter((v) =>
    (FORMAT_VALIDATION_MODIFIERS as readonly string[]).includes(v),
  );
}