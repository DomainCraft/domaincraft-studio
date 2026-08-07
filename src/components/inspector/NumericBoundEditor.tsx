import { useCallback } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface NumericBoundEditorProps {
  validations: Record<string, string>;
  onValidationChange: (key: string, value: string | null) => void;
}

export default function NumericBoundEditor({ validations, onValidationChange }: NumericBoundEditorProps) {
  const clearAndSet = useCallback((keysToClear: string[], keyToSet: string) => {
    const currentVal = keysToClear.map(k => validations[k]).find(v => v !== undefined && v !== '') ?? '';
    for (const k of keysToClear) {
      onValidationChange(k, null);
    }
    onValidationChange(keyToSet, currentVal || null);
  }, [validations, onValidationChange]);

  const lowerKey = validations['gt'] !== undefined ? 'gt' : 'gte';
  const upperKey = validations['lt'] !== undefined ? 'lt' : 'lte';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <BoundButton
          label=">="
          active={validations['gte'] !== undefined}
          onClick={() => clearAndSet(['gte', 'gt'], 'gte')}
        />
        <BoundButton
          label=">"
          active={validations['gt'] !== undefined}
          onClick={() => clearAndSet(['gte', 'gt'], 'gt')}
        />
        <Input
          type="number"
          value={validations['gte'] || validations['gt'] || ''}
          onChange={(e) => onValidationChange(lowerKey, e.target.value || null)}
          placeholder="min"
          className="flex-1"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <BoundButton
          label="<="
          active={validations['lte'] !== undefined}
          onClick={() => clearAndSet(['lte', 'lt'], 'lte')}
        />
        <BoundButton
          label="<"
          active={validations['lt'] !== undefined}
          onClick={() => clearAndSet(['lte', 'lt'], 'lt')}
        />
        <Input
          type="number"
          value={validations['lte'] || validations['lt'] || ''}
          onChange={(e) => onValidationChange(upperKey, e.target.value || null)}
          placeholder="max"
          className="flex-1"
        />
      </div>
    </div>
  );
}

function BoundButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button
      variant={active ? 'primary' : 'ghost'}
      size="sm"
      onClick={onClick}
      className={`border ${active ? 'border-blue-600' : 'border-border'}`}
    >
      {label}
    </Button>
  );
}
