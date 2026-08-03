import { useEffect, useState, useMemo } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { validateDomainSchema, type ValidationError } from '@/lib/validator';

export function useValidationErrors() {
  const schemaVersion = useDomainStore((s) => s.schemaVersion);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      const schema = useDomainStore.getState().schema;
      const result = validateDomainSchema(schema);
      if (!cancelled) setErrors(result);
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

  return { errors, hardErrors, warnings };
}
