import type { ParsedField, EntityDefinition } from '@/types/domain';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';

interface RelationConfigProps {
  parsed: ParsedField;
  entities: Record<string, EntityDefinition>;
  onUpdate: (field: Partial<ParsedField>) => void;
}

export default function RelationConfig({ parsed, entities, onUpdate }: RelationConfigProps) {
  return (
    <>
      <Select
        label="Target Entity"
        value={parsed.target || ''}
        onChange={(e) => onUpdate({ target: e.target.value })}
      >
        <option value="">-- Select --</option>
        {Object.keys(entities).map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </Select>
      <Checkbox
        checked={parsed.isArray || false}
        onChange={(checked) => onUpdate({ isArray: checked })}
        label="One-to-many"
      />
    </>
  );
}
