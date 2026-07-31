import type { ParsedField } from '@/types/domain';
import Select from '@/components/ui/Select';

interface EnumConfigProps {
  parsed: ParsedField;
  enums?: Record<string, string[]>;
  onUpdate: (field: Partial<ParsedField>) => void;
}

export default function EnumConfig({ parsed, enums, onUpdate }: EnumConfigProps) {
  return (
    <Select
      label="Enum Name"
      value={parsed.target || ''}
      onChange={(e) => onUpdate({ target: e.target.value })}
    >
      <option value="">-- Select --</option>
      {Object.keys(enums || {}).map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </Select>
  );
}
