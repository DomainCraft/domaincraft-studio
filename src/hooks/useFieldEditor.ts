import { useState, useMemo, useCallback } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { getFormatValidators } from '@/lib/specmeta';
import { parseFieldDefinition, serializeFieldDefinition } from '@/lib/yaml-parser';
import type { ParsedField } from '@/types/domain';
import { useDebouncedCallback } from './useDebouncedCallback';

export function useFieldEditor(entityName: string, fieldName: string) {
  const entity = useDomainStore((s) => s.schema.entities[entityName]);
  const updateField = useDomainStore((s) => s.updateField);
  const definition = entity?.fields[fieldName] || '';

  const parsed = useMemo(() => parseFieldDefinition(fieldName, definition), [fieldName, definition]);
  const [localParsed, setLocalParsed] = useState<ParsedField>(parsed);

  const target = `${entityName}:${fieldName}:${definition}`;
  const [prevTarget, setPrevTarget] = useState(target);
  if (prevTarget !== target) {
    setPrevTarget(target);
    setLocalParsed(parsed);
  }

  const debouncedUpdateField = useDebouncedCallback((next: ParsedField) => {
    updateField(entityName, fieldName, serializeFieldDefinition(next));
  }, 200);

  const applyUpdate = useCallback((next: ParsedField) => {
    setLocalParsed(next);
    debouncedUpdateField(next);
  }, [debouncedUpdateField]);

  const updateValidation = useCallback((key: string, value: string | null) => {
    setLocalParsed(prev => {
      const next = { ...prev };
      if (value === null) {
        delete next.validations[key];
      } else {
        next.validations[key] = value;
      }
      debouncedUpdateField(next);
      return next;
    });
  }, [debouncedUpdateField]);

  const setFormatValidator = useCallback((key: string) => {
    setLocalParsed(prev => {
      const next = { ...prev };
      if (next.validations[key] === 'true') {
        delete next.validations[key];
      } else {
        getFormatValidators().forEach((fv) => delete next.validations[fv]);
        next.validations[key] = 'true';
      }
      debouncedUpdateField(next);
      return next;
    });
  }, [debouncedUpdateField]);

  return {
    localParsed,
    applyUpdate,
    updateValidation,
    setFormatValidator,
  };
}
