import { useState } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { Plus, Trash2, X } from 'lucide-react';

export default function EnumManager() {
  const { schema, addEnum, removeEnum, updateEnum } = useDomainStore();
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const enums = schema.enums || {};

  const handleAdd = () => {
    const name = newName.trim();
    if (!name || enums[name]) return;
    addEnum(name, []);
    setNewName('');
    setShowAdd(false);
  };

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
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Enums</span>
        <button onClick={() => setShowAdd(!showAdd)} className="p-1 rounded hover:bg-accent">
          <Plus size={14} />
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Enum name..."
            className="flex-1 px-2 py-1 text-xs rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
            autoFocus
          />
          <button onClick={handleAdd} className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
            Add
          </button>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(enums).map(([name, values]) => (
          <div key={name} className="rounded border p-2 space-y-2" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{name}</span>
              <button onClick={() => removeEnum(name)} className="p-1 rounded hover:bg-destructive/10 hover:text-destructive">
                <Trash2 size={12} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {values.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full"
                  style={{ background: 'hsl(var(--muted))' }}
                >
                  {val}
                  <button onClick={() => handleRemoveValue(name, val)} className="hover:text-destructive">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-1">
              <input
                type="text"
                value={editValues[name] || ''}
                onChange={(e) => setEditValues((prev) => ({ ...prev, [name]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddValue(name)}
                placeholder="Add value..."
                className="flex-1 px-2 py-1 text-xs rounded border bg-transparent"
                style={{ borderColor: 'hsl(var(--border))' }}
              />
              <button onClick={() => handleAddValue(name)} className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                +
              </button>
            </div>
          </div>
        ))}

        {Object.keys(enums).length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-4">No enums defined</div>
        )}
      </div>
    </div>
  );
}
