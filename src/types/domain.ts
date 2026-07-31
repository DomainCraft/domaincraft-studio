// GUI-specific types (not derived from JSON Schema)

export interface ParsedField {
  name: string;
  type: string;
  target?: string;
  isArray?: boolean;
  validations: Record<string, string>;
}

// Re-export all generated types from the JSON Schema (single source of truth)
export type {
  AuthConfig,
  CacheConfig,
  DomainSchema,
  Project,
  MultiTenancy,
  EntityDefinition,
  IndexDefinition,
  EntityPermissions,
} from './domain.generated';
