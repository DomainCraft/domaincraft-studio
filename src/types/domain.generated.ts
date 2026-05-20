// @generated -- run `npm run generate:types` to regenerate
// Source: DomainCraft/spec/domain.schema.json
// Do not edit manually. Changes will be overwritten.

export interface DomainSchema {
  api_style?: 'rest' | 'graphql' | 'grpc';
  auth?: string;
  database?: 'postgresql' | 'mysql' | 'sqlite' | 'mssql' | 'mongodb';
  entities: {
    [k: string]: EntityDefinition;
  };
  enums?: {
    [k: string]: string[];
  };
  project: Project;
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
  type?: string;
  unique?: boolean;
}
export interface EntityPermissions {
  create?: string[];
  delete?: string[];
  read?: string[];
  read_public?: string;
  update?: string[];
}
export interface Project {
  description?: string;
  multi_tenancy?: MultiTenancy;
  name: string;
  version?: string;
}
export interface MultiTenancy {
  enabled: boolean;
  mode?: string;
}
