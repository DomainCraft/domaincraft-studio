import { create } from 'zustand';
import type { DomainSchema } from '@/types/domain';
import { parseDomainYaml, serializeDomainYaml } from '@/lib/yaml-parser';
import { createMutations } from './domain-mutations';

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
  updateEntity: (name: string, update: Partial<import('@/types/domain').EntityDefinition>) => void;
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
  updateAuth: (update: Partial<import('@/types/domain').AuthConfig>) => void;

  addIndex: (entityName: string, index: import('@/types/domain').IndexDefinition) => void;
  removeIndex: (entityName: string, indexIdx: number) => void;
  updateIndex: (entityName: string, indexIdx: number, index: import('@/types/domain').IndexDefinition) => void;

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

export const useDomainStore = create<DomainState>((set, get) => {
  const mutations = createMutations(
    get as () => DomainState,
    set as (p: Partial<DomainState>) => void,
  );

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
      mutations.addEntity(name);
      set({ selectedEntity: name, selectedField: null });
    },

    removeEntity: (name) => {
      mutations.removeEntity(name);
    },

    renameEntity: mutations.renameEntity,
    updateEntity: mutations.updateEntity,
    addField: mutations.addField,

    removeField: (entityName, fieldName) => {
      mutations.removeField(entityName, fieldName);
    },

    updateField: mutations.updateField,
    addEnum: mutations.addEnum,
    removeEnum: mutations.removeEnum,
    updateEnum: mutations.updateEnum,
    updateProject: mutations.updateProject,
    updateSchemaField: mutations.updateSchemaField,
    updateAuth: mutations.updateAuth,
    addIndex: mutations.addIndex,
    removeIndex: mutations.removeIndex,
    updateIndex: mutations.updateIndex,
    addSeedEntry: mutations.addSeedEntry,
    removeSeedEntry: mutations.removeSeedEntry,
    updateSeedEntry: mutations.updateSeedEntry,

    addRoleToEntity: mutations.addRoleToEntity,
    removeRole: mutations.removeRole,

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
