import { useEffect, useState, useMemo } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { validateDomainSchema, type ValidationError } from '@/lib/validator';
import { isWasmReady, onWasmReady, loadWasmValidator } from '@/lib/wasm-loader';

export function useValidationErrors() {
  const schemaVersion = useDomainStore((s) => s.schemaVersion);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [wasmLoading, setWasmLoading] = useState(() => !isWasmReady());

  useEffect(() => {
    if (!isWasmReady()) {
      loadWasmValidator();
    }
    return onWasmReady(() => setWasmLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      const schema = useDomainStore.getState().schema;
      validateDomainSchema(schema).then((result) => {
        if (!cancelled) setErrors(result);
      });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [schemaVersion]);

  const { hardErrors, warnings } = useMemo(() => {
    const hard: ValidationError[] = [];
    const warn: ValidationError[] = [];
    for (const e of errors) {
      if (e.warning) warn.push(e); else hard.push(e);
    }
    return { hardErrors: hard, warnings: warn };
  }, [errors]);

  return { errors, hardErrors, warnings, wasmLoading };
}
