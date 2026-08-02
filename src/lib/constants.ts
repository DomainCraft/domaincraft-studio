// @generated — run `npm run generate:types` to regenerate
// Source: DomainCraft/internal/specmeta/specmeta.go
// Do not edit manually.

export const PRIMITIVE_FIELD_TYPES = ['string', 'text', 'int', 'bigint', 'float', 'decimal', 'boolean', 'date', 'datetime', 'uuid', 'json', 'jsonb'] as const;

export const STRING_FIELD_TYPES = new Set(['string', 'text']);
export const NUMERIC_FIELD_TYPES = new Set(['int', 'bigint', 'float', 'decimal']);

 export const STRING_VALIDATION_MODIFIERS = ['min', 'max', 'email', 'url', 'ipv4', 'regex'] as const;
 export const STRING_FORMAT_VALIDATORS = ['email', 'url', 'ipv4'] as const;
 export const NUMERIC_VALIDATION_MODIFIERS = ['gte', 'gt', 'lte', 'lt'] as const;

export const ON_DELETE_VALUES = ['cascade', 'set_null', 'restrict', 'no_action'] as const;

export const INDEX_TYPES = ['btree', 'hash', 'gist', 'gin', 'brin'] as const;

export const DATABASES = ['postgresql', 'mysql', 'sqlite', 'mssql', 'mongodb'] as const;
export const API_STYLES = ['rest', 'graphql', 'grpc'] as const;
export const AUTH_TYPES = ['jwt', 'none'] as const;

export const FEATURES = ['audit', 'audit_log', 'soft_delete', 'optimistic_lock', 'event_sourced', 'cacheable'] as const;

export const CACHE_PROVIDERS = ['redis', 'memcached', 'in-memory'] as const;
export const MULTI_TENANCY_MODES = ['column', 'schema', 'database'] as const;
export const PERMISSION_KEYS = ['read', 'create', 'update', 'delete'] as const;
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export const RATE_LIMIT_POLICIES = ['fixed', 'sliding'] as const;
export const INFRA_QUEUES = ['pubsub', 'rabbitmq', 'kafka', 'redis', 'nats', 'in-memory'] as const;
export const INFRA_CACHE_STORES = ['redis', 'memcached', 'in-memory'] as const;
export const INFRA_SECRET_STORES = ['local', 'kubernetes', 'azure-keyvault', 'aws-secrets'] as const;
export const INFRA_STORAGES = ['local', 's3', 'azure-blob', 'gcs'] as const;
