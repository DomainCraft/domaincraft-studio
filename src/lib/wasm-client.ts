import { isWasmReady } from './wasm-loader';

export { isWasmReady };

export interface WasmParsedField {
  Name: string;
  Type: string;
  TargetEntity?: string;
  TargetType?: string;
  IsPrimary: boolean;
  IsOptional: boolean;
  IsUnique: boolean;
  IsHidden: boolean;
  IsRequired: boolean;
  IsMany: boolean;
  OnDelete?: string;
  Validations: Record<string, string>;
  DefaultValue?: string;
  DefaultIsFunc: boolean;
}

export interface WasmValidationResult {
  errors: Array<{
    entity?: string;
    field?: string;
    message: string;
    warning?: boolean;
  }>;
  parse: boolean;
}

export interface WasmRawEntity {
  features?: string[];
  fields: Record<string, string>;
  fieldOrder?: string[];
  indexes?: Array<{
    fields: string[];
    type?: string;
    sort?: string[];
    unique?: boolean;
  }>;
  permissions?: {
    read?: string[];
    create?: string[];
    update?: string[];
    delete?: string[];
  };
  seed?: Record<string, unknown>[];
}

export interface WasmRawSchema {
  project: {
    name: string;
    description?: string;
    version?: string;
    platform?: string;
    multi_tenancy?: { enabled: boolean; mode?: string };
    cache?: { enabled: boolean; provider?: string; connection_string?: string; ttl_seconds?: number };
    cors?: { enabled: boolean; origins?: string[] };
    deploy?: { domain?: string; port?: number };
  };
  database?: string;
  auth?: {
    type: string;
    entity?: string;
    roles?: string[];
    endpoints?: { login?: boolean; register?: boolean; me?: boolean };
  };
  apiStyle?: string;
  entities: Record<string, WasmRawEntity>;
  enums?: Record<string, string[]>;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function wasmCall<T>(fn: ((def: string, name?: string) => string) | undefined, args: unknown[]): T | null {
  if (!isWasmReady() || !fn) return null;
  try {
    const raw = fn(...args as [string, ...string[]]);
    const result = JSON.parse(raw);
    if (result.error) {
      console.error('WASM error:', result.error);
      return null;
    }
    if (result === null || result === undefined) {
      console.error('WASM returned null/undefined');
      return null;
    }
    return result as T;
  } catch (e) {
    console.error('WASM call failed:', e);
    return null;
  }
}

function validateWasmParsedField(result: Record<string, unknown>): WasmParsedField | null {
  if (typeof result.Type !== 'string') {
    console.error('WASM goParseField: Type is not string:', result);
    return null;
  }
  if (result.Validations !== undefined && !isRecord(result.Validations)) {
    console.error('WASM goParseField: Validations is not a record:', result);
    return null;
  }
  if (typeof result.IsPrimary !== 'boolean') {
    console.error('WASM goParseField: IsPrimary is not boolean:', result);
    return null;
  }
  if (typeof result.IsOptional !== 'boolean') {
    console.error('WASM goParseField: IsOptional is not boolean:', result);
    return null;
  }
  return {
    Name: typeof result.Name === 'string' ? result.Name : '',
    Type: result.Type as string,
    TargetEntity: typeof result.TargetEntity === 'string' ? result.TargetEntity : undefined,
    TargetType: typeof result.TargetType === 'string' ? result.TargetType : undefined,
    IsPrimary: result.IsPrimary as boolean,
    IsOptional: result.IsOptional as boolean,
    IsUnique: typeof result.IsUnique === 'boolean' ? result.IsUnique : false,
    IsHidden: typeof result.IsHidden === 'boolean' ? result.IsHidden : false,
    IsRequired: typeof result.IsRequired === 'boolean' ? result.IsRequired : false,
    IsMany: typeof result.IsMany === 'boolean' ? result.IsMany : false,
    OnDelete: typeof result.OnDelete === 'string' ? result.OnDelete : undefined,
    Validations: isRecord(result.Validations) ? result.Validations as Record<string, string> : {},
    DefaultValue: typeof result.DefaultValue === 'string' ? result.DefaultValue : undefined,
    DefaultIsFunc: typeof result.DefaultIsFunc === 'boolean' ? result.DefaultIsFunc : false,
  };
}

function validateWasmAuthEndpoints(raw: unknown): NonNullable<WasmRawSchema['auth']>['endpoints'] | undefined {
  if (!isRecord(raw)) return undefined;
  const endpoints: NonNullable<NonNullable<WasmRawSchema['auth']>['endpoints']> = {};
  if (typeof raw.login === 'boolean') endpoints.login = raw.login;
  if (typeof raw.register === 'boolean') endpoints.register = raw.register;
  if (typeof raw.me === 'boolean') endpoints.me = raw.me;
  return Object.keys(endpoints).length > 0 ? endpoints : undefined;
}

export function wasmParseField(fieldDef: string, fieldName?: string): WasmParsedField | null {
  const result = wasmCall<Record<string, unknown>>(window.goParseField, [fieldDef, fieldName ?? '']);
  if (!result) return null;
  return validateWasmParsedField(result);
}

export function wasmParseDomain(yamlText: string): WasmRawSchema | null {
  const result = wasmCall<Record<string, unknown>>(window.goParseDomain, [yamlText]);
  if (!result) return null;
  if (!isRecord(result.project) || !isRecord(result.entities)) {
    console.error('WASM goParseDomain: missing project or entities:', result);
    return null;
  }
  if (typeof result.project.name !== 'string') {
    console.error('WASM goParseDomain: project.name is not a string:', result);
    return null;
  }
  return {
    project: result.project as WasmRawSchema['project'],
    database: typeof result.database === 'string' ? result.database : undefined,
    auth: isRecord(result.auth) ? {
      type: typeof result.auth.type === 'string' ? result.auth.type : 'none',
      entity: typeof result.auth.entity === 'string' ? result.auth.entity : undefined,
      roles: Array.isArray(result.auth.roles) ? result.auth.roles as string[] : undefined,
      endpoints: validateWasmAuthEndpoints(result.auth.endpoints),
    } : undefined,
    apiStyle: typeof result.apiStyle === 'string' ? result.apiStyle : undefined,
    entities: result.entities as Record<string, WasmRawEntity>,
    enums: isRecord(result.enums) ? result.enums as Record<string, string[]> : undefined,
  };
}

export function wasmValidate(yamlText: string): WasmValidationResult | null {
  const result = wasmCall<Record<string, unknown>>(window.goValidate, [yamlText]);
  if (!result) return null;
  if (!Array.isArray(result.errors)) {
    console.error('WASM goValidate: errors is not an array:', result);
    return null;
  }
  const errors = result.errors as unknown[];
  for (const err of errors) {
    if (!isRecord(err) || typeof err.message !== 'string') {
      console.error('WASM goValidate: invalid error entry:', err);
      return null;
    }
  }
  return {
    errors: (result.errors as Array<Record<string, unknown>>).map((e) => ({
      entity: typeof e.entity === 'string' ? e.entity : undefined,
      field: typeof e.field === 'string' ? e.field : undefined,
      message: e.message as string,
      warning: typeof e.warning === 'boolean' ? e.warning : undefined,
    })),
    parse: typeof result.parse === 'boolean' ? result.parse : true,
  };
}
