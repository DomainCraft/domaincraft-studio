// @generated — run `npm run generate:types` to regenerate
// Source: DomainCraft/spec/domain.schema.json
// Do not edit manually.

export interface DomainSchema {
  api_style?: 'rest' | 'graphql' | 'grpc';
  auth?: AuthConfig;
  database?: 'postgresql' | 'mysql' | 'sqlite' | 'mssql' | 'mongodb';
  entities: {
    [k: string]: EntityDefinition;
  };
  enums?: {
    [k: string]: string[];
  };
  project: Project;
}
export interface AuthConfig {
  endpoints?: AuthEndpoints;
  /**
   * Entity with email+password fields (auto-detected if omitted)
   */
  entity?: string;
  roles?: string[];
  type: 'jwt' | 'none';
}
export interface AuthEndpoints {
  /**
   * Generate login endpoint (default: true)
   */
  login?: boolean;
  /**
   * Generate /me endpoint (default: true)
   */
  me?: boolean;
  /**
   * Generate register endpoint (default: true)
   */
  register?: boolean;
}
/**
 * An entity. Valid keys: old_name, features, fields, indexes, permissions, seed. There is no `relations:` key — relations are declared as fields of type `relation(Target)` (see the fields description).
 */
export interface EntityDefinition {
  features?: ('audit' | 'audit_log' | 'soft_delete' | 'optimistic_lock' | 'event_sourced' | 'cacheable')[];
  /**
   * Field definitions. Each value is a definition string: `type [modifiers]` (e.g. `string [required, max:255]`). Relations are fields, not a separate key: `relation(Target) [many]` for many-to-many, `relation(Target) [required, on_delete:cascade]`, `relation(Target) [optional, on_delete:set_null]`. `on_delete` accepts cascade|restrict|set_null|no_action. Flag modifiers: `required`, `optional`, `unique`, `hidden`, `readonly`, `primary`, `many`, `email`, `url`, `ipv4`. Key:value modifiers: `min:N`, `max:N`, `gte:N`, `lte:N`, `gt:N`, `lt:N`, `regex:"..."`, `default:...`, `old_name:<previousName>`. `old_name` is a rename hint for the migration engine: the field was previously named `<previousName>`, so bridges can generate a safe `RenameColumn` instead of a destructive drop + add. `hidden` excludes a field from API responses; `readonly` keeps it in responses but excludes it from create/update/patch requests (server-owned). Do not put a space after `:` inside the definition string (`default:5`, not `default: 5`); quoted string defaults are allowed (`default:"pending"`).
   */
  fields: {
    [k: string]: string;
  };
  indexes?: IndexDefinition[];
  /**
   * Previous entity name — a hint for the migration engine to detect renames
   */
  old_name?: string;
  permissions?: EntityPermissions;
  seed?: {
    [k: string]: unknown;
  }[];
}
export interface IndexDefinition {
  fields: string[];
  sort?: string[];
  type?: 'btree' | 'hash' | 'gist' | 'gin' | 'brin';
  unique?: boolean;
}
export interface EntityPermissions {
  create?: string[];
  delete?: string[];
  read?: string[];
  update?: string[];
}
export interface Project {
  cache?: CacheConfig;
  cors?: CORSConfig;
  deploy?: DeployConfig;
  description?: string;
  infrastructure?: InfrastructureConfig;
  multi_tenancy?: MultiTenancy;
  name: string;
  pagination?: PaginationConfig;
  /**
   * Target platform version (e.g. net10.0). Defaults to net10.0 for the csharp bridge.
   */
  platform?: string;
  rate_limit?: RateLimitConfig;
  version?: string;
  versioning?: VersioningConfig;
}
export interface CacheConfig {
  connection_string?: string;
  enabled: boolean;
  /**
   * Cache provider
   */
  provider?: 'redis' | 'memcached' | 'in-memory';
  ttl_seconds?: number;
}
export interface CORSConfig {
  enabled: boolean;
  origins?: string[];
}
export interface DeployConfig {
  /**
   * API domain (e.g. localhost, api.example.com)
   */
  domain?: string;
  /**
   * Exposed application port (default: 8080)
   */
  port?: number;
}
export interface InfrastructureConfig {
  /**
   * Distributed cache store
   */
  cache?: 'redis' | 'memcached' | 'in-memory';
  /**
   * Message broker
   */
  queue?: 'pubsub' | 'rabbitmq' | 'kafka' | 'redis' | 'nats' | 'in-memory';
  /**
   * Secrets store
   */
  secrets?: 'local' | 'kubernetes' | 'azure-keyvault' | 'aws-secrets';
  /**
   * Object/file storage
   */
  storage?: 'local' | 's3' | 'azure-blob' | 'gcs';
}
export interface MultiTenancy {
  enabled: boolean;
  mode?: 'column' | 'schema' | 'database';
}
export interface PaginationConfig {
  /**
   * Default page size (default: 20)
   */
  default_page_size?: number;
  /**
   * Hard cap on page size (default: 200)
   */
  max_page_size?: number;
}
export interface RateLimitConfig {
  /**
   * Enable request rate limiting (default: true)
   */
  enabled?: boolean;
  /**
   * Max requests (default: 100)
   */
  permit_limit?: number;
  /**
   * Limiter algorithm (default: fixed)
   */
  policy?: 'fixed' | 'sliding';
  /**
   * Window duration in seconds (default: 60)
   */
  window_seconds?: number;
}
export interface VersioningConfig {
  /**
   * Default API version (default: 1.0)
   */
  default_version?: string;
  /**
   * Enable API versioning (default: true)
   */
  enabled?: boolean;
}
