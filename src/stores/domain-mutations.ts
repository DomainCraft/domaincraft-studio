import type { DomainSchema, EntityDefinition, IndexDefinition, AuthConfig } from '@/types/domain';
import { serializeDomainYaml } from '@/lib/yaml-parser';
import { PERMISSION_KEYS } from '@/lib/constants';

type DomainState = {
  schema: DomainSchema;
  yamlText: string;
  lastChangeSource: 'gui' | 'yaml' | null;
  selectedEntity: string | null;
  selectedField: string | null;
  fieldOrder: Record<string, string[]>;
  schemaVersion: number;
};

type SchemaGetter = () => DomainState;
type SchemaSetter = (partial: Partial<DomainState>) => void;

const YAML_DEBOUNCE_MS = 200;

export function createMutations(get: SchemaGetter, set: SchemaSetter) {
  let yamlTimer: ReturnType<typeof setTimeout> | null = null;

  function applyMutation(mutator: (schema: DomainSchema) => DomainSchema) {
    const { schema } = get();
    const newSchema = mutator(schema);
    const newVersion = get().schemaVersion + 1;
    set({ schema: newSchema, lastChangeSource: 'gui', schemaVersion: newVersion });
    if (yamlTimer) clearTimeout(yamlTimer);
    yamlTimer = setTimeout(() => {
      const current = get();
      set({ yamlText: serializeDomainYaml(current.schema, current.fieldOrder) });
    }, YAML_DEBOUNCE_MS);
  }

  function setFieldOrder(entityName: string, order: string[]) {
    set({ fieldOrder: { ...get().fieldOrder, [entityName]: order } });
  }

  function deleteFieldOrder(entityName: string) {
    const next = { ...get().fieldOrder };
    delete next[entityName];
    set({ fieldOrder: next });
  }

  function getFieldOrder(entityName: string): string[] | undefined {
    return get().fieldOrder[entityName];
  }

  return {
    applyMutation,

    addEntity: (name: string) => {
      applyMutation((s) => ({
        ...s,
        entities: {
          ...s.entities,
          [name]: { fields: { id: 'uuid [primary]' } },
        },
      }));
      setFieldOrder(name, ['id']);
      set({ selectedEntity: name, selectedField: null });
    },

    removeEntity: (name: string) => {
      applyMutation((s) => {
        const rest = { ...s.entities };
        delete rest[name];
        return { ...s, entities: rest };
      });
      deleteFieldOrder(name);
    },

    renameEntity: (oldName: string, newName: string) => {
      if (oldName === newName || get().schema.entities[newName]) return;
      applyMutation((s) => {
        const entity = s.entities[oldName];
        if (!entity) return s;
        const rest = { ...s.entities };
        delete rest[oldName];
        return { ...s, entities: { ...rest, [newName]: entity } };
      });
      const order = getFieldOrder(oldName);
      if (order) {
        setFieldOrder(newName, order);
        deleteFieldOrder(oldName);
      }
      set({ selectedEntity: newName });
    },

    updateEntity: (name: string, update: Partial<EntityDefinition>) => {
      applyMutation((s) => {
        const entity = s.entities[name];
        if (!entity) return s;
        return { ...s, entities: { ...s.entities, [name]: { ...entity, ...update } } };
      });
    },

    addField: (entityName: string, fieldName: string, definition: string) => {
      const entity = get().schema.entities[entityName];
      if (!entity || entity.fields[fieldName]) return;
      applyMutation((s) => {
        const currentEntity = s.entities[entityName];
        if (!currentEntity) return s;
        return {
          ...s,
          entities: {
            ...s.entities,
            [entityName]: { ...currentEntity, fields: { ...currentEntity.fields, [fieldName]: definition } },
          },
        };
      });
      const order = getFieldOrder(entityName) || Object.keys(entity.fields);
      if (!order.includes(fieldName)) {
        setFieldOrder(entityName, [...order, fieldName]);
      }
    },

    removeField: (entityName: string, fieldName: string) => {
      applyMutation((s) => {
        const entity = s.entities[entityName];
        if (!entity) return s;
        const rest = { ...entity.fields };
        delete rest[fieldName];
        return { ...s, entities: { ...s.entities, [entityName]: { ...entity, fields: rest } } };
      });
      const order = getFieldOrder(entityName);
      if (order) {
        setFieldOrder(entityName, order.filter((k) => k !== fieldName));
      }
    },

    updateField: (entityName: string, fieldName: string, definition: string) => {
      applyMutation((s) => {
        const entity = s.entities[entityName];
        if (!entity) return s;
        return {
          ...s,
          entities: {
            ...s.entities,
            [entityName]: { ...entity, fields: { ...entity.fields, [fieldName]: definition } },
          },
        };
      });
    },

    addEnum: (name: string, values: string[]) => {
      applyMutation((s) => ({
        ...s,
        enums: { ...(s.enums || {}), [name]: values },
      }));
    },

    removeEnum: (name: string) => {
      applyMutation((s) => {
        const rest = { ...(s.enums || {}) };
        delete rest[name];
        return { ...s, enums: rest };
      });
    },

    updateEnum: (name: string, values: string[]) => {
      applyMutation((s) => ({
        ...s,
        enums: { ...(s.enums || {}), [name]: values },
      }));
    },

    updateProject: (update: Partial<DomainSchema['project']>) => {
      applyMutation((s) => ({
        ...s,
        project: { ...s.project, ...update },
      }));
    },

    updateSchemaField: <K extends keyof DomainSchema>(key: K, value: DomainSchema[K]) => {
      applyMutation((s) => ({ ...s, [key]: value }));
    },

    updateAuth: (update: Partial<AuthConfig>) => {
      applyMutation((s) => ({
        ...s,
        auth: { ...(s.auth || { type: 'jwt' as const }), ...update },
      }));
    },

    addIndex: (entityName: string, index: IndexDefinition) => {
      applyMutation((s) => {
        const entity = s.entities[entityName];
        if (!entity) return s;
        const indexes = [...(entity.indexes || []), index];
        return { ...s, entities: { ...s.entities, [entityName]: { ...entity, indexes } } };
      });
    },

    removeIndex: (entityName: string, indexIdx: number) => {
      applyMutation((s) => {
        const entity = s.entities[entityName];
        if (!entity || !entity.indexes) return s;
        const indexes = entity.indexes.filter((_, i) => i !== indexIdx);
        return { ...s, entities: { ...s.entities, [entityName]: { ...entity, indexes } } };
      });
    },

    updateIndex: (entityName: string, indexIdx: number, index: IndexDefinition) => {
      applyMutation((s) => {
        const entity = s.entities[entityName];
        if (!entity || !entity.indexes) return s;
        const indexes = [...entity.indexes];
        indexes[indexIdx] = index;
        return { ...s, entities: { ...s.entities, [entityName]: { ...entity, indexes } } };
      });
    },

    addSeedEntry: (entityName: string, entry: Record<string, unknown>) => {
      applyMutation((s) => {
        const entity = s.entities[entityName];
        if (!entity) return s;
        const seed = [...(entity.seed || []), entry];
        return { ...s, entities: { ...s.entities, [entityName]: { ...entity, seed } } };
      });
    },

    removeSeedEntry: (entityName: string, entryIdx: number) => {
      applyMutation((s) => {
        const entity = s.entities[entityName];
        if (!entity || !entity.seed) return s;
        const seed = entity.seed.filter((_, i) => i !== entryIdx);
        return { ...s, entities: { ...s.entities, [entityName]: { ...entity, seed } } };
      });
    },

    updateSeedEntry: (entityName: string, entryIdx: number, entry: Record<string, unknown>) => {
      applyMutation((s) => {
        const entity = s.entities[entityName];
        if (!entity || !entity.seed) return s;
        const seed = [...entity.seed];
        seed[entryIdx] = entry;
        return { ...s, entities: { ...s.entities, [entityName]: { ...entity, seed } } };
      });
    },

    addRoleToEntity: (entityName: string, role: string) => {
      applyMutation((s) => {
        const entity = s.entities[entityName];
        if (!entity) return s;
        const permissions = { ...entity.permissions };
        permissions.read = [...(permissions.read || []), role];
        return { ...s, entities: { ...s.entities, [entityName]: { ...entity, permissions } } };
      });
    },

    removeRole: (role: string) => {
      applyMutation((s) => {
        const nextEntities = { ...s.entities };
        for (const [name, ent] of Object.entries(s.entities)) {
          if (!ent.permissions) continue;
          const nextPerms = { ...ent.permissions };
          let changed = false;
          for (const op of PERMISSION_KEYS) {
            const current = nextPerms[op] || [];
            const filtered = current.filter((r) => r !== role);
            if (filtered.length !== current.length) {
              nextPerms[op] = filtered;
              changed = true;
            }
          }
          if (changed) {
            nextEntities[name] = { ...ent, permissions: nextPerms };
          }
        }
        return { ...s, entities: nextEntities };
      });
    },
  };
}
