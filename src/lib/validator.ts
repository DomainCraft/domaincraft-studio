import { loadWasmValidator, isWasmReady } from './wasm-loader';
import { wasmValidate } from './wasm-client';
import type { DomainSchema } from '@/types/domain';
import { serializeDomainYaml } from './yaml-parser';

export interface ValidationError {
  path: string;
  message: string;
  warning: boolean;
}

export async function validateDomainSchema(schema: DomainSchema): Promise<ValidationError[]> {
  if (isWasmReady()) {
    return validateWithWasm(schema);
  }

  const loaded = await loadWasmValidator();
  if (loaded && isWasmReady()) {
    return validateWithWasm(schema);
  }

  console.warn('WASM validator unavailable — skipping validation');
  return [];
}

function validateWithWasm(schema: DomainSchema): ValidationError[] {
  try {
    const yamlText = serializeDomainYaml(schema);
    const result = wasmValidate(yamlText);
    if (!result) return [];

    return result.errors.map((e) => ({
      path: e.entity
        ? e.field
          ? `entities.${e.entity}.fields.${e.field}`
          : `entities.${e.entity}`
        : '<schema>',
      message: e.message,
      warning: e.warning ?? false,
    }));
  } catch (e) {
    console.error('WASM validation error:', e);
    return [];
  }
}
