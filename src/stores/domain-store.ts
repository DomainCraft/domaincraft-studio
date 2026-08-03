import { create } from 'zustand';
import type { DomainSchema, EntityDefinition, IndexDefinition, AuthConfig } from '@/types/domain';
import { parseDomainYaml, serializeDomainYaml } from '@/lib/yaml-parser';
import { SPECMETA } from '@/lib/specmeta';

interface DomainState {
  schema: DomainSchema;
  selectedEntity: string | null;
  selectedField: string | null;
  yamlText: string;
  lastChangeSource: 'gui' | 'yaml' | null;
  fieldOrder: Record<string, string[]>;
  schemaVersion: number;

  setSchema: (schema: DomainSchema) => void;
  setYamlText: (text: string) => void;
  syncFromYaml: () => void;
  syncToYaml: () => void;

  addEntity: (name: string) => void;
  removeEntity: (name: string) => void;
  renameEntity: (oldName: string, newName: string) => void;
  updateEntity: (name: string, update: Partial<EntityDefinition>) => void;
  selectEntity: (name: string | null) => void;

  addField: (entityName: string, fieldName: string, definition: string) => void;
  removeField: (entityName: string, fieldName: string) => void;
  updateField: (entityName: string, fieldName: string, definition: string) => void;
  selectField: (fieldName: string | null) => void;

  addEnum: (name: string, values: string[]) => void;
  removeEnum: (name: string) => void;
  updateEnum: (name: string, values: string[]) => void;

  updateProject: (update: Partial<DomainSchema['project']>) => void;
  updateSchemaField: <K extends keyof DomainSchema>(key: K, value: DomainSchema[K]) => void;
  updateAuth: (update: Partial<AuthConfig>) => void;

  addIndex: (entityName: string, index: IndexDefinition) => void;
  removeIndex: (entityName: string, indexIdx: number) => void;
  updateIndex: (entityName: string, indexIdx: number, index: IndexDefinition) => void;

  addSeedEntry: (entityName: string, entry: Record<string, unknown>) => void;
  removeSeedEntry: (entityName: string, entryIdx: number) => void;
  updateSeedEntry: (entityName: string, entryIdx: number, entry: Record<string, unknown>) => void;

  addRoleToEntity: (entityName: string, role: string) => void;
  removeRole: (role: string) => void;

  getAllRoles: () => string[];
  loadSample: () => void;
}

const defaultSchema: DomainSchema = {
  project: { name: 'MyApp' },
  entities: {},
};

const YAML_DEBOUNCE_MS = 200;

export const useDomainStore = create<DomainState>((set, get) => {
  let yamlTimer: ReturnType<typeof setTimeout> | null = null;

  function applyMutation(mutator: (schema: DomainSchema) => DomainSchema) {
    set({
      schema: mutator(get().schema),
      lastChangeSource: 'gui',
      schemaVersion: get().schemaVersion + 1,
    });
    if (yamlTimer) clearTimeout(yamlTimer);
    yamlTimer = setTimeout(() => {
      set({ yamlText: serializeDomainYaml(get().schema, get().fieldOrder) });
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

  function updateEntityFields(entityName: string, updater: (entity: EntityDefinition) => EntityDefinition) {
    applyMutation((s) => {
      const entity = s.entities[entityName];
      if (!entity) return s;
      return { ...s, entities: { ...s.entities, [entityName]: updater(entity) } };
    });
  }

  return {
    schema: defaultSchema,
    selectedEntity: null,
    selectedField: null,
    yamlText: serializeDomainYaml(defaultSchema),
    lastChangeSource: null,
    fieldOrder: {},
    schemaVersion: 0,

    setSchema: (schema) => {
      set({ schema, yamlText: serializeDomainYaml(schema, get().fieldOrder), lastChangeSource: 'gui', schemaVersion: get().schemaVersion + 1 });
    },

    setYamlText: (text) => set({ yamlText: text }),

    syncFromYaml: () => {
      const { yamlText } = get();
      try {
        const result = parseDomainYaml(yamlText);
        set({ schema: result.schema, lastChangeSource: 'yaml', fieldOrder: result.fieldOrder, schemaVersion: get().schemaVersion + 1 });
      } catch (e) {
        console.error('Failed to parse YAML:', e);
      }
    },

    syncToYaml: () => {
      const { schema, fieldOrder } = get();
      set({ yamlText: serializeDomainYaml(schema, fieldOrder), lastChangeSource: 'gui' });
    },

    selectEntity: (name) => set({ selectedEntity: name, selectedField: null }),
    selectField: (fieldName) => set({ selectedField: fieldName }),

    addEntity: (name) => {
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

    removeEntity: (name) => {
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
        // Record old_name so the CLI migration engine detects the rename
        // and can offer to rename orphaned custom files.
        return { ...s, entities: { ...rest, [newName]: { ...entity, old_name: oldName } } };
      });
      const order = getFieldOrder(oldName);
      if (order) {
        setFieldOrder(newName, order);
        deleteFieldOrder(oldName);
      }
      set({ selectedEntity: newName });
    },

    updateEntity: (name: string, update: Partial<EntityDefinition>) => {
      updateEntityFields(name, (entity) => ({ ...entity, ...update }));
    },

    addField: (entityName: string, fieldName: string, definition: string) => {
      const entity = get().schema.entities[entityName];
      if (!entity || entity.fields[fieldName]) return;
      updateEntityFields(entityName, (current) => ({
        ...current,
        fields: { ...current.fields, [fieldName]: definition },
      }));
      const order = getFieldOrder(entityName) || Object.keys(entity.fields);
      if (!order.includes(fieldName)) {
        setFieldOrder(entityName, [...order, fieldName]);
      }
    },

    removeField: (entityName: string, fieldName: string) => {
      updateEntityFields(entityName, (entity) => {
        const rest = { ...entity.fields };
        delete rest[fieldName];
        return { ...entity, fields: rest };
      });
      const order = getFieldOrder(entityName);
      if (order) {
        setFieldOrder(entityName, order.filter((k) => k !== fieldName));
      }
    },

    updateField: (entityName: string, fieldName: string, definition: string) => {
      updateEntityFields(entityName, (entity) => ({
        ...entity,
        fields: { ...entity.fields, [fieldName]: definition },
      }));
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
      updateEntityFields(entityName, (entity) => ({
        ...entity,
        indexes: [...(entity.indexes || []), index],
      }));
    },

    removeIndex: (entityName: string, indexIdx: number) => {
      updateEntityFields(entityName, (entity) => {
        if (!entity.indexes) return entity;
        return { ...entity, indexes: entity.indexes.filter((_, i) => i !== indexIdx) };
      });
    },

    updateIndex: (entityName: string, indexIdx: number, index: IndexDefinition) => {
      updateEntityFields(entityName, (entity) => {
        if (!entity.indexes) return entity;
        const indexes = [...entity.indexes];
        indexes[indexIdx] = index;
        return { ...entity, indexes };
      });
    },

    addSeedEntry: (entityName: string, entry: Record<string, unknown>) => {
      updateEntityFields(entityName, (entity) => ({
        ...entity,
        seed: [...(entity.seed || []), entry],
      }));
    },

    removeSeedEntry: (entityName: string, entryIdx: number) => {
      updateEntityFields(entityName, (entity) => {
        if (!entity.seed) return entity;
        return { ...entity, seed: entity.seed.filter((_, i) => i !== entryIdx) };
      });
    },

    updateSeedEntry: (entityName: string, entryIdx: number, entry: Record<string, unknown>) => {
      updateEntityFields(entityName, (entity) => {
        if (!entity.seed) return entity;
        const seed = [...entity.seed];
        seed[entryIdx] = entry;
        return { ...entity, seed };
      });
    },

    addRoleToEntity: (entityName: string, role: string) => {
      updateEntityFields(entityName, (entity) => {
        const permissions = { ...entity.permissions };
        permissions.read = [...(permissions.read || []), role];
        return { ...entity, permissions };
      });
    },

    removeRole: (role: string) => {
      applyMutation((s) => {
        const nextEntities = { ...s.entities };
        for (const [name, ent] of Object.entries(s.entities)) {
          if (!ent.permissions) continue;
          const nextPerms = { ...ent.permissions };
          let changed = false;
          const permissionOps = SPECMETA.permissionKeys as Array<keyof NonNullable<EntityDefinition['permissions']>>;
          for (const op of permissionOps) {
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

    getAllRoles: () => {
      const { schema } = get();
      const roles = new Set<string>();
      const crudOps = ['read', 'create', 'update', 'delete'] as const;
      for (const ent of Object.values(schema.entities)) {
        for (const op of crudOps) {
          for (const role of (ent.permissions?.[op] || [])) {
            roles.add(role);
          }
        }
      }
      return Array.from(roles).sort();
    },

    loadSample: () => {
      import('@/lib/sample-data').then(({ sampleYaml }) => {
        try {
          const result = parseDomainYaml(sampleYaml);
          set({ schema: result.schema, yamlText: serializeDomainYaml(result.schema, result.fieldOrder), selectedEntity: null, selectedField: null, fieldOrder: result.fieldOrder, schemaVersion: get().schemaVersion + 1 });
        } catch (e) {
          console.error('Failed to load sample:', e);
        }
      });
    },
  };
});
