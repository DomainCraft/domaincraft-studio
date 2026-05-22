import { create } from 'zustand';
import type { DomainSchema, EntityDefinition } from '@/types/domain';
import { parseDomainYaml, serializeDomainYaml } from '@/lib/yaml-parser';

const sampleYaml = `project:
  name: EcommercePlatform
  description: Sample e-commerce API
database: postgresql
auth: jwt

enums:
  UserRole:
    - Admin
    - Editor
    - Customer
    - Guest
  OrderStatus:
    - Pending
    - Paid
    - Shipped
    - Delivered
    - Cancelled

entities:
  User:
    fields:
      id: uuid [primary]
      email: string [required, unique, email]
      password: string [required, hidden]
      firstName: string [required, min:2, max:50]
      lastName: string [required, min:2, max:50]
      role: enum(UserRole) [default:Customer]
      phoneNumbers: array(string)
      isActive: boolean [default:true]
    features:
      - audit
      - soft_delete
    permissions:
      read: ["*"]
      create: ["*"]
      update: ["@Owner", Admin]
      delete: [Admin]

  Product:
    fields:
      id: uuid [primary]
      title: string [required, min:3, max:200]
      description: text
      price: decimal [required, gte:0]
      sku: string [unique]
      tags: array(string)
      supplierId: relation(User)
    features:
      - audit
      - soft_delete
    permissions:
      read: ["*"]
      create: [Admin]
      update: [Admin]
      delete: [Admin]
    seed:
      - id: "550e8400-e29b-41d4-a716-446655440001"
        title: "Widget"
        price: "9.99"
        sku: "WIDGET-001"

  Order:
    fields:
      id: uuid [primary]
      userId: relation(User) [required]
      status: enum(OrderStatus) [default:Pending]
      total: decimal [required, gte:0]
    features:
      - audit
      - optimistic_lock
    permissions:
      read: [Admin, "@Owner"]
      create: [User]
      update: ["@Owner"]
      delete: [Admin]
`;

interface DomainState {
  schema: DomainSchema;
  selectedEntity: string | null;
  selectedField: string | null;
  yamlText: string;
  lastChangeSource: 'gui' | 'yaml' | null;

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

  loadSample: () => void;
}

const defaultSchema: DomainSchema = {
  project: { name: 'MyApp' },
  entities: {},
};

export const useDomainStore = create<DomainState>((set, get) => ({
  schema: defaultSchema,
  selectedEntity: null,
  selectedField: null,
  yamlText: serializeDomainYaml(defaultSchema),
  lastChangeSource: null,

  setSchema: (schema) => {
    set({ schema, lastChangeSource: 'gui' });
    set({ yamlText: serializeDomainYaml(schema), lastChangeSource: null });
  },

  setYamlText: (text) => set({ yamlText: text }),

  syncFromYaml: () => {
    const { yamlText } = get();
    try {
      const schema = parseDomainYaml(yamlText);
      set({ schema, lastChangeSource: 'yaml' });
    } catch (e) {
      console.error('Failed to parse YAML:', e);
    }
  },

  syncToYaml: () => {
    const { schema } = get();
    set({ yamlText: serializeDomainYaml(schema), lastChangeSource: 'gui' });
  },

  addEntity: (name) => {
    const { schema } = get();
    const newSchema = {
      ...schema,
      entities: {
        ...schema.entities,
        [name]: { fields: { id: 'uuid [primary]' } },
      },
    };
    set({ schema: newSchema, selectedEntity: name, selectedField: null });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  removeEntity: (name) => {
    const { schema, selectedEntity } = get();
    const rest = { ...schema.entities };
    delete rest[name];
    const newSchema = { ...schema, entities: rest };
    set({
      schema: newSchema,
      selectedEntity: selectedEntity === name ? null : selectedEntity,
    });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  renameEntity: (oldName, newName) => {
    const { schema, selectedEntity } = get();
    if (oldName === newName || schema.entities[newName]) return;
    const entity = schema.entities[oldName];
    const rest = { ...schema.entities };
    delete rest[oldName];
    const newSchema = { ...schema, entities: { ...rest, [newName]: entity } };
    set({
      schema: newSchema,
      selectedEntity: selectedEntity === oldName ? newName : selectedEntity,
    });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  updateEntity: (name, update) => {
    const { schema } = get();
    const entity = schema.entities[name];
    if (!entity) return;
    const newSchema = {
      ...schema,
      entities: { ...schema.entities, [name]: { ...entity, ...update } },
    };
    set({ schema: newSchema });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  selectEntity: (name) => set({ selectedEntity: name, selectedField: null }),

  addField: (entityName, fieldName, definition) => {
    const { schema } = get();
    const entity = schema.entities[entityName];
    if (!entity || entity.fields[fieldName]) return;
    const newSchema = {
      ...schema,
      entities: {
        ...schema.entities,
        [entityName]: {
          ...entity,
          fields: { ...entity.fields, [fieldName]: definition },
        },
      },
    };
    set({ schema: newSchema });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  removeField: (entityName, fieldName) => {
    const { schema, selectedField } = get();
    const entity = schema.entities[entityName];
    if (!entity) return;
    const rest = { ...entity.fields };
    delete rest[fieldName];
    const newSchema = {
      ...schema,
      entities: {
        ...schema.entities,
        [entityName]: { ...entity, fields: rest },
      },
    };
    set({
      schema: newSchema,
      selectedField: selectedField === fieldName ? null : selectedField,
    });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  updateField: (entityName, fieldName, definition) => {
    const { schema } = get();
    const entity = schema.entities[entityName];
    if (!entity) return;
    const newSchema = {
      ...schema,
      entities: {
        ...schema.entities,
        [entityName]: {
          ...entity,
          fields: { ...entity.fields, [fieldName]: definition },
        },
      },
    };
    set({ schema: newSchema });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  selectField: (fieldName) => set({ selectedField: fieldName }),

  addEnum: (name, values) => {
    const { schema } = get();
    const newSchema = {
      ...schema,
      enums: { ...(schema.enums || {}), [name]: values },
    };
    set({ schema: newSchema });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  removeEnum: (name) => {
    const { schema } = get();
    const rest = { ...(schema.enums || {}) };
    delete rest[name];
    const newSchema = { ...schema, enums: rest };
    set({ schema: newSchema });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  updateEnum: (name, values) => {
    const { schema } = get();
    const newSchema = {
      ...schema,
      enums: { ...(schema.enums || {}), [name]: values },
    };
    set({ schema: newSchema });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  updateProject: (update) => {
    const { schema } = get();
    const newSchema = { ...schema, project: { ...schema.project, ...update } };
    set({ schema: newSchema });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  updateSchemaField: (key, value) => {
    const { schema } = get();
    const newSchema = { ...schema, [key]: value };
    set({ schema: newSchema });
    set({ yamlText: serializeDomainYaml(newSchema) });
  },

  loadSample: () => {
    try {
      const schema = parseDomainYaml(sampleYaml);
      set({ schema, yamlText: sampleYaml, selectedEntity: null, selectedField: null });
    } catch (e) {
      console.error('Failed to load sample:', e);
    }
  },
}));
