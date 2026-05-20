import { useState, useMemo } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { parseFieldDefinition, serializeFieldDefinition } from '@/lib/yaml-parser';
import type { ParsedField } from '@/types/domain';

const fieldTypes = [
  'string', 'text', 'int', 'int64', 'float', 'float64', 'decimal',
  'boolean', 'bool', 'uuid', 'time.Time', 'date', 'datetime',
  'json', 'jsonb',
];

const stringTypes = new Set(['string', 'text']);
const numericTypes = new Set(['int', 'int64', 'float', 'float64', 'decimal']);
const formatValidators = ['email', 'url', 'ipv4'];

function getRangeError(v: Record<string, string>): string | null {
  const min = parseFloat(v['min']);
  const max = parseFloat(v['max']);
  if (!isNaN(min) && !isNaN(max) && min > max) return 'min cannot be greater than max';
  // Check lower bound vs upper bound (any combination)
  const lower = parseFloat(v['gte'] ?? v['gt']);
  const upper = parseFloat(v['lte'] ?? v['lt']);
  if (!isNaN(lower) && !isNaN(upper)) {
    if (lower > upper) return 'Lower bound cannot exceed upper bound';
    if (lower === upper && (v['gt'] !== undefined || v['lt'] !== undefined)) {
      return 'Lower bound must be less than upper bound';
    }
  }
  return null;
}

export default function FieldEditor({ entityName, fieldName }: { entityName: string; fieldName: string }) {
  const { schema, updateField } = useDomainStore();
  const entity = schema.entities[entityName];
  const definition = entity?.fields[fieldName] || '';

  const initialParsed = useMemo(() => parseFieldDefinition(fieldName, definition), [fieldName, definition]);
  const [parsed, setParsed] = useState<ParsedField>(initialParsed);
  const [targetInput, setTargetInput] = useState('');

  // Sync when field changes externally
  if (parsed.name !== fieldName || parsed.type !== initialParsed.type) {
    setParsed(initialParsed);
    setTargetInput(initialParsed.target || '');
  }

  const updateParsed = (updates: Partial<ParsedField>) => {
    const next = { ...parsed, ...updates };
    setParsed(next);
    const newDef = serializeFieldDefinition(next);
    updateField(entityName, fieldName, newDef);
  };

  const updateValidation = (key: string, value: string | null) => {
    const next = { ...parsed };
    if (value === null) {
      delete next.validations[key];
    } else {
      next.validations[key] = value;
    }
    setParsed(next);
    const newDef = serializeFieldDefinition(next);
    updateField(entityName, fieldName, newDef);
  };

  // Set a format validator, removing other format validators (mutually exclusive)
  const setFormatValidator = (key: string) => {
    const next = { ...parsed };
    if (next.validations[key] === 'true') {
      // Toggle off
      delete next.validations[key];
    } else {
      // Remove other format validators, set this one
      formatValidators.forEach((fv) => delete next.validations[fv]);
      next.validations[key] = 'true';
    }
    setParsed(next);
    const newDef = serializeFieldDefinition(next);
    updateField(entityName, fieldName, newDef);
  };

  // Clear type-incompatible validations when type changes
  const handleTypeChange = (newType: string) => {
    const next: ParsedField = {
      ...parsed,
      type: newType,
      target: ['relation', 'enum', 'array'].includes(newType) ? targetInput : undefined,
    };
    // Remove format validators if not string type
    if (!stringTypes.has(newType)) {
      formatValidators.forEach((fv) => delete next.validations[fv]);
    }
    // Remove string-length validators if not string type
    if (!stringTypes.has(newType)) {
      delete next.validations.min;
      delete next.validations.max;
    }
    // Remove numeric validators if not numeric type
    if (!numericTypes.has(newType)) {
      delete next.validations.gte;
      delete next.validations.lte;
      delete next.validations.gt;
      delete next.validations.lt;
    }
    setParsed(next);
    const newDef = serializeFieldDefinition(next);
    updateField(entityName, fieldName, newDef);
  };

  const isRelation = parsed.type === 'relation';
  const isEnum = parsed.type === 'enum';
  const isString = stringTypes.has(parsed.type);
  const isNumeric = numericTypes.has(parsed.type);
  const hasFormatValidator = formatValidators.some((fv) => parsed.validations[fv] === 'true');

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold uppercase text-muted-foreground">Field: {fieldName}</span>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Type</label>
        <select
          value={parsed.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded border bg-transparent"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          {fieldTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
          <option value="relation">relation</option>
          <option value="enum">enum</option>
          <option value="array">array</option>
        </select>
      </div>

      {(isRelation || isEnum) && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {isRelation ? 'Target Entity' : 'Enum Name'}
          </label>
          <input
            type="text"
            value={targetInput}
            onChange={(e) => {
              setTargetInput(e.target.value);
              updateParsed({ target: e.target.value });
            }}
            className="w-full px-2 py-1.5 text-xs rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
            placeholder={isRelation ? 'e.g. Order' : 'e.g. Status'}
          />
        </div>
      )}

      {isRelation && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${fieldName}-many`}
            checked={parsed.isArray || false}
            onChange={(e) => updateParsed({ isArray: e.target.checked })}
            className="rounded"
          />
          <label htmlFor={`${fieldName}-many`} className="text-xs">Many (array)</label>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Validations</span>

        {/* General flags */}
        <div className="grid grid-cols-2 gap-1.5">
          {['required', 'unique', 'hidden', 'primary'].map((key) => (
            <label key={key} className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={parsed.validations[key] === 'true'}
                onChange={(e) => updateValidation(key, e.target.checked ? 'true' : null)}
                className="rounded"
              />
              {key}
            </label>
          ))}
        </div>

        {/* Format validators (string only, mutually exclusive) */}
        {isString && (
          <div>
            <span className="text-xs text-muted-foreground mb-1 block">Format</span>
            <div className="flex gap-1.5">
              {formatValidators.map((key) => (
                <button
                  key={key}
                  onClick={() => setFormatValidator(key)}
                  className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                    parsed.validations[key] === 'true'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            {hasFormatValidator && (
              <p className="text-[10px] text-muted-foreground mt-1">Only one format validator allowed</p>
            )}
          </div>
        )}

        {/* String length validators */}
        {isString && (
          <div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-xs text-muted-foreground">min length</label>
                <input
                  type="number"
                  value={parsed.validations['min'] || ''}
                  onChange={(e) => updateValidation('min', e.target.value || null)}
                  className={`w-full px-2 py-1 text-xs rounded border bg-transparent ${
                    getRangeError(parsed.validations) ? 'border-red-500' : ''
                  }`}
                  style={{ borderColor: getRangeError(parsed.validations) ? undefined : 'hsl(var(--border))' }}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">max length</label>
                <input
                  type="number"
                  value={parsed.validations['max'] || ''}
                  onChange={(e) => updateValidation('max', e.target.value || null)}
                  className={`w-full px-2 py-1 text-xs rounded border bg-transparent ${
                    getRangeError(parsed.validations) ? 'border-red-500' : ''
                  }`}
                  style={{ borderColor: getRangeError(parsed.validations) ? undefined : 'hsl(var(--border))' }}
                  placeholder="255"
                />
              </div>
            </div>
            {getRangeError(parsed.validations) && (
              <p className="text-[10px] text-red-500 mt-1">{getRangeError(parsed.validations)}</p>
            )}
          </div>
        )}

        {/* Numeric comparison validators — paired bounds */}
        {isNumeric && (
          <div>
            <div className="space-y-1.5">
              {/* Lower bound */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const next = { ...parsed };
                    const val = next.validations['gte'] ?? next.validations['gt'] ?? '';
                    delete next.validations['gte'];
                    delete next.validations['gt'];
                    next.validations['gte'] = val;
                    setParsed(next);
                    updateField(entityName, fieldName, serializeFieldDefinition(next));
                  }}
                  className={`px-1.5 py-0.5 text-xs rounded border transition-colors ${
                    parsed.validations['gte'] !== undefined ? 'bg-blue-600 text-white border-blue-600' : 'border-border'
                  }`}
                >
                  &gt;=
                </button>
                <button
                  onClick={() => {
                    const next = { ...parsed };
                    const val = next.validations['gte'] ?? next.validations['gt'] ?? '';
                    delete next.validations['gte'];
                    delete next.validations['gt'];
                    next.validations['gt'] = val;
                    setParsed(next);
                    updateField(entityName, fieldName, serializeFieldDefinition(next));
                  }}
                  className={`px-1.5 py-0.5 text-xs rounded border transition-colors ${
                    parsed.validations['gt'] !== undefined ? 'bg-blue-600 text-white border-blue-600' : 'border-border'
                  }`}
                >
                  &gt;
                </button>
                <input
                  type="number"
                  value={parsed.validations['gte'] || parsed.validations['gt'] || ''}
                  onChange={(e) => {
                    const key = parsed.validations['gt'] !== undefined ? 'gt' : 'gte';
                    updateValidation(key, e.target.value || null);
                  }}
                  className={`flex-1 px-2 py-1 text-xs rounded border bg-transparent ${
                    getRangeError(parsed.validations) ? 'border-red-500' : ''
                  }`}
                  style={{ borderColor: getRangeError(parsed.validations) ? undefined : 'hsl(var(--border))' }}
                  placeholder="min"
                />
              </div>
              {/* Upper bound */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const next = { ...parsed };
                    const val = next.validations['lte'] ?? next.validations['lt'] ?? '';
                    delete next.validations['lte'];
                    delete next.validations['lt'];
                    next.validations['lte'] = val;
                    setParsed(next);
                    updateField(entityName, fieldName, serializeFieldDefinition(next));
                  }}
                  className={`px-1.5 py-0.5 text-xs rounded border transition-colors ${
                    parsed.validations['lte'] !== undefined ? 'bg-blue-600 text-white border-blue-600' : 'border-border'
                  }`}
                >
                  &lt;=
                </button>
                <button
                  onClick={() => {
                    const next = { ...parsed };
                    const val = next.validations['lte'] ?? next.validations['lt'] ?? '';
                    delete next.validations['lte'];
                    delete next.validations['lt'];
                    next.validations['lt'] = val;
                    setParsed(next);
                    updateField(entityName, fieldName, serializeFieldDefinition(next));
                  }}
                  className={`px-1.5 py-0.5 text-xs rounded border transition-colors ${
                    parsed.validations['lt'] !== undefined ? 'bg-blue-600 text-white border-blue-600' : 'border-border'
                  }`}
                >
                  &lt;
                </button>
                <input
                  type="number"
                  value={parsed.validations['lte'] || parsed.validations['lt'] || ''}
                  onChange={(e) => {
                    const key = parsed.validations['lte'] !== undefined ? 'lte' : 'lt';
                    updateValidation(key, e.target.value || null);
                  }}
                  className={`flex-1 px-2 py-1 text-xs rounded border bg-transparent ${
                    getRangeError(parsed.validations) ? 'border-red-500' : ''
                  }`}
                  style={{ borderColor: getRangeError(parsed.validations) ? undefined : 'hsl(var(--border))' }}
                  placeholder="max"
                />
              </div>
            </div>
            {getRangeError(parsed.validations) && (
              <p className="text-[10px] text-red-500 mt-1">{getRangeError(parsed.validations)}</p>
            )}
          </div>
        )}

        {/* Default value */}
        <div>
          <label className="text-xs text-muted-foreground">default</label>
          <input
            type="text"
            value={parsed.validations['default'] || ''}
            onChange={(e) => updateValidation('default', e.target.value || null)}
            className="w-full px-2 py-1 text-xs rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
            placeholder="default value"
          />
        </div>

        {/* Regex (string only) */}
        {isString && (
          <div>
            <label className="text-xs text-muted-foreground">regex</label>
            <input
              type="text"
              value={parsed.validations['regex'] || ''}
              onChange={(e) => updateValidation('regex', e.target.value || null)}
              className="w-full px-2 py-1 text-xs rounded border bg-transparent"
              style={{ borderColor: 'hsl(var(--border))' }}
              placeholder="^[A-Za-z]+$"
            />
          </div>
        )}

        {/* on_delete (relation only) */}
        {isRelation && (
          <div>
            <label className="text-xs text-muted-foreground">on_delete</label>
            <select
              value={parsed.validations['on_delete'] || ''}
              onChange={(e) => updateValidation('on_delete', e.target.value || null)}
              className="w-full px-2 py-1.5 text-xs rounded border bg-transparent"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <option value="">None</option>
              <option value="cascade">Cascade</option>
              <option value="set_null">Set Null</option>
              <option value="restrict">Restrict</option>
              <option value="no_action">No Action</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
