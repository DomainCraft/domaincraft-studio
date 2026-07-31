import { useState } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { Trash2, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import AddItem from '@/components/ui/AddItem';

const EMPTY_ENUMS: Record<string, string[]> = {};

export default function EnumManager() {
  const enums = useDomainStore((s) => s.schema.enums ?? EMPTY_ENUMS);
  const addEnum = useDomainStore((s) => s.addEnum);
  const removeEnum = useDomainStore((s) => s.removeEnum);
  const updateEnum = useDomainStore((s) => s.updateEnum);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const handleAddValue = (enumName: string) => {
    const val = (editValues[enumName] || '').trim();
    if (!val) return;
    const current = enums[enumName] || [];
    if (current.includes(val)) return;
    updateEnum(enumName, [...current, val]);
    setEditValues((prev) => ({ ...prev, [enumName]: '' }));
  };

  const handleRemoveValue = (enumName: string, value: string) => {
    const current = enums[enumName] || [];
    updateEnum(enumName, current.filter((v) => v !== value));
  };

  return (
    <div className="space-y-3">
      <AddItem
        label="Enums"
        placeholder="Enum name..."
        onAdd={(name) => addEnum(name, [])}
        validate={(name) => !enums[name]}
      />

      <div className="space-y-3">
        {Object.entries(enums).map(([name, values]) => (
          <div key={name} className="rounded border p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{name}</span>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeEnum(name)}
              >
                <Trash2 size={12} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1">
              {values.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full bg-muted"
                >
                  {val}
                  <Button
                    variant="destructive"
                    className="p-0.5 hover:text-destructive"
                    onClick={() => handleRemoveValue(name, val)}
                  >
                    <X size={10} />
                  </Button>
                </span>
              ))}
            </div>

            <div className="flex gap-1">
              <Input
                value={editValues[name] || ''}
                onChange={(e) => setEditValues((prev) => ({ ...prev, [name]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddValue(name)}
                placeholder="Add value..."
                className="flex-1"
              />
              <Button onClick={() => handleAddValue(name)} size="sm">+</Button>
            </div>
          </div>
        ))}

        {Object.keys(enums).length === 0 && (
          <EmptyState message="No enums defined" />
        )}
      </div>
    </div>
  );
}
