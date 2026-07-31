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
export interface EntityDefinition {
  features?: ('audit' | 'audit_log' | 'soft_delete' | 'optimistic_lock')[];
  fields: {
    [k: string]: string;
  };
  indexes?: IndexDefinition[];
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
  multi_tenancy?: MultiTenancy;
  name: string;
  /**
   * Target platform version (e.g. net9.0, net8.0)
   */
  platform?: string;
  version?: string;
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
export interface MultiTenancy {
  enabled: boolean;
  mode?: 'column' | 'schema' | 'database';
}
