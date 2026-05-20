import { z } from 'zod';
import { parseFieldDefinition } from './yaml-parser';
import type { DomainSchema } from '@/types/domain';

const identifierRegex = /^[A-Za-z_][A-Za-z0-9_]*$/;

const entityDefinitionSchema = z.object({
  fields: z.record(z.string(), z.string()).refine(
    (fields) => {
      for (const [name, def] of Object.entries(fields)) {
        try {
          const parsed = parseFieldDefinition(name, def as string);
          if (!parsed.type) return false;
        } catch {
          return false;
        }
      }
      return true;
    },
    { message: 'One or more field definitions are invalid' }
  ),
  features: z.array(z.enum(['audit', 'audit_log', 'soft_delete', 'optimistic_lock'])).optional(),
  permissions: z
    .object({
      read: z.array(z.string()).optional(),
      create: z.array(z.string()).optional(),
      update: z.array(z.string()).optional(),
      delete: z.array(z.string()).optional(),
      read_public: z.string().optional(),
    })
    .optional(),
  indexes: z
    .array(
      z.object({
        fields: z.array(z.string()).min(1),
        type: z.string().optional(),
        sort: z.array(z.string()).optional(),
        unique: z.boolean().optional(),
      })
    )
    .optional(),
  seed: z.array(z.record(z.string(), z.unknown())).optional(),
});

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  version: z.string().optional(),
  multi_tenancy: z.object({ enabled: z.boolean(), mode: z.string().optional() }).optional(),
});

const domainSchemaZod = z.object({
  project: projectSchema,
  database: z.enum(['postgresql', 'mysql', 'sqlite', 'mssql', 'mongodb']).optional(),
  auth: z.string().optional(),
  api_style: z.enum(['rest', 'graphql', 'grpc']).optional(),
  entities: z.record(z.string(), entityDefinitionSchema),
  enums: z.record(z.string(), z.array(z.string())).optional(),
});

export interface ValidationError {
  path: string;
  message: string;
}

export function validateDomainSchema(schema: DomainSchema): ValidationError[] {
  const errors: ValidationError[] = [];

  const result = domainSchemaZod.safeParse(schema);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push({
        path: issue.path.join('.'),
        message: issue.message,
      });
    }
  }

  const entityNames = Object.keys(schema.entities);

  for (const name of entityNames) {
    if (!identifierRegex.test(name)) {
      errors.push({ path: `entities.${name}`, message: `Invalid entity name: "${name}"` });
    }
  }

  for (const [entityName, entity] of Object.entries(schema.entities)) {
    for (const [fieldName, fieldStr] of Object.entries(entity.fields)) {
      try {
        const parsed = parseFieldDefinition(fieldName, fieldStr);
        if (parsed.type === 'relation' && parsed.target && !entityNames.includes(parsed.target)) {
          errors.push({
            path: `entities.${entityName}.fields.${fieldName}`,
            message: `Relation target "${parsed.target}" does not exist`,
          });
        }
        if (parsed.type === 'enum' && parsed.target && schema.enums && !schema.enums[parsed.target]) {
          errors.push({
            path: `entities.${entityName}.fields.${fieldName}`,
            message: `Enum "${parsed.target}" is not defined`,
          });
        }
        const min = parsed.validations['min'];
        const max = parsed.validations['max'];
        if (min && max && Number(min) > Number(max)) {
          errors.push({
            path: `entities.${entityName}.fields.${fieldName}`,
            message: `min (${min}) is greater than max (${max})`,
          });
        }
        const gte = parsed.validations['gte'];
        const lte = parsed.validations['lte'];
        if (gte && lte && Number(gte) > Number(lte)) {
          errors.push({
            path: `entities.${entityName}.fields.${fieldName}`,
            message: `gte (${gte}) is greater than lte (${lte})`,
          });
        }
      } catch {
        errors.push({
          path: `entities.${entityName}.fields.${fieldName}`,
          message: `Cannot parse field definition: "${fieldStr}"`,
        });
      }
    }

    if (entity.indexes) {
      const fieldNames = Object.keys(entity.fields);
      for (const [i, index] of entity.indexes.entries()) {
        for (const f of index.fields) {
          if (!fieldNames.includes(f)) {
            errors.push({
              path: `entities.${entityName}.indexes[${i}]`,
              message: `Index field "${f}" does not exist in entity`,
            });
          }
        }
      }
    }
  }

  return errors;
}
