import type { ParsedField } from '@/types/domain';
import TagInput from '@/components/ui/TagInput';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface DefaultValueEditorProps {
  parsed: ParsedField;
  enums?: Record<string, string[]>;
  onValidationChange: (key: string, value: string | null) => void;
}

export default function DefaultValueEditor({ parsed, enums, onValidationChange }: DefaultValueEditorProps) {
  const isEnum = parsed.type === 'enum';

  if (parsed.isArray) {
    return (
      <TagInput
        tags={(() => {
          const raw = parsed.validations['default'] || '';
          if (!raw || raw === '[]') return [];
          return raw.replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean);
        })()}
        onChange={(tags) => onValidationChange('default', tags.length > 0 ? `[${tags.join(', ')}]` : null)}
        placeholder="Add items..."
      />
    );
  }

  if (isEnum && parsed.target && enums?.[parsed.target]) {
    const enumValues = enums[parsed.target] ?? [];
    return (
      <Select
        value={parsed.validations['default'] || ''}
        onChange={(e) => onValidationChange('default', e.target.value || null)}
      >
        <option value="">-- None --</option>
        {enumValues.map((val) => (
          <option key={val} value={val}>{val}</option>
        ))}
      </Select>
    );
  }

  return (
    <Input
      value={parsed.validations['default'] || ''}
      onChange={(e) => onValidationChange('default', e.target.value || null)}
      placeholder="default value"
    />
  );
}
