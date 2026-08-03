import { useCallback } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { SPECMETA, getFormatValidators } from '@/lib/specmeta';
import { useFieldEditor } from '@/hooks/useFieldEditor';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import NumericBoundEditor from './NumericBoundEditor';
import FormatValidator from './FormatValidator';
import DefaultValueEditor from './DefaultValueEditor';
import RelationConfig from './RelationConfig';
import EnumConfig from './EnumConfig';

export default function FieldEditor({ entityName, fieldName }: { entityName: string; fieldName: string }) {
  const enums = useDomainStore((s) => s.schema.enums);
  const allEntities = useDomainStore((s) => s.schema.entities);
  const { localParsed, applyUpdate, updateValidation, setFormatValidator } = useFieldEditor(entityName, fieldName);

  const handleTypeChange = useCallback((newType: string) => {
    const next = {
      ...localParsed,
      type: newType,
      target: ['relation', 'enum'].includes(newType) ? localParsed.target : undefined,
      validations: { ...localParsed.validations },
    };
    if (!SPECMETA.stringFieldTypes.includes(newType)) {
      for (const key of [...getFormatValidators(), 'min', 'max', 'regex']) {
        delete next.validations[key];
      }
    }
    if (!SPECMETA.numericFieldTypes.includes(newType)) {
      for (const key of SPECMETA.numericValidationModifiers) {
        delete next.validations[key];
      }
    }
    applyUpdate(next);
  }, [localParsed, applyUpdate]);

  const isRelation = localParsed.type === 'relation';
  const isEnum = localParsed.type === 'enum';
  const isString = SPECMETA.stringFieldTypes.includes(localParsed.type);
  const isNumeric = SPECMETA.numericFieldTypes.includes(localParsed.type);
  const canBeArray = !isRelation;

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase text-muted-foreground">Field: {fieldName}</span>

      <Select
        label="Type"
        value={localParsed.type}
        onChange={(e) => handleTypeChange(e.target.value)}
      >
        {SPECMETA.primitiveFieldTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
        <option value="relation">relation</option>
        <option value="enum">enum</option>
      </Select>

      {canBeArray && (
        <Checkbox
          checked={localParsed.isArray || false}
          onChange={(checked) => applyUpdate({ ...localParsed, isArray: checked })}
          label="Array (list of values)"
        />
      )}

      {isRelation && (
        <RelationConfig
          parsed={localParsed}
          entities={allEntities}
          onUpdate={(field) => applyUpdate({ ...localParsed, ...field })}
        />
      )}

      {isEnum && (
        <EnumConfig
          parsed={localParsed}
          enums={enums}
          onUpdate={(field) => applyUpdate({ ...localParsed, ...field })}
        />
      )}

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Validations</span>

        <div className="grid grid-cols-2 gap-1.5">
          {(['required', 'optional', 'unique', 'hidden', 'primary'] as const).map((key) => (
            <Checkbox
              key={key}
              checked={localParsed.validations[key] === 'true'}
              onChange={(checked) => updateValidation(key, checked ? 'true' : null)}
              label={key}
            />
          ))}
        </div>

        {isString && (
          <FormatValidator validations={localParsed.validations} onToggle={setFormatValidator} />
        )}

        {isString && (
          <div className="grid grid-cols-2 gap-1.5">
            <Input
              label="min length"
              type="number"
              value={localParsed.validations['min'] || ''}
              onChange={(e) => updateValidation('min', e.target.value || null)}
              placeholder="0"
            />
            <Input
              label="max length"
              type="number"
              value={localParsed.validations['max'] || ''}
              onChange={(e) => updateValidation('max', e.target.value || null)}
              placeholder="255"
            />
          </div>
        )}

        {isNumeric && (
          <NumericBoundEditor
            validations={localParsed.validations}
            onValidationChange={updateValidation}
          />
        )}

        <div>
          <label className="text-xs text-muted-foreground">default</label>
          <DefaultValueEditor
            parsed={localParsed}
            enums={enums}
            onValidationChange={updateValidation}
          />
        </div>

        {isString && (
          <Input
            label="regex"
            value={localParsed.validations['regex'] || ''}
            onChange={(e) => updateValidation('regex', e.target.value || null)}
            placeholder="^[A-Za-z]+$"
          />
        )}

        {isRelation && (
          <Select
            label="on_delete"
            value={localParsed.validations['on_delete'] || ''}
            onChange={(e) => updateValidation('on_delete', e.target.value || null)}
          >
            <option value="">None</option>
            {SPECMETA.onDeleteValues.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}
