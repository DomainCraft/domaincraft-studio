import { useState } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { Plus, Trash2, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

interface Props {
  entityName: string;
}

export default function SeedEditor({ entityName }: Props) {
  const entity = useDomainStore((s) => s.schema.entities[entityName]);
  const addSeedEntry = useDomainStore((s) => s.addSeedEntry);
  const removeSeedEntry = useDomainStore((s) => s.removeSeedEntry);
  const updateSeedEntry = useDomainStore((s) => s.updateSeedEntry);
  const fields = entity?.fields || {};
  const seed = entity?.seed || [];
  const fieldNames = Object.keys(fields);
  const [adding, setAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<Record<string, string>>({});

  const handleAdd = () => {
    const entry: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(newEntry)) {
      if (v.trim() === '') continue;
      if (v === 'true') { entry[k] = true; continue; }
      if (v === 'false') { entry[k] = false; continue; }
      const num = Number(v);
      if (!isNaN(num) && v.trim() !== '') { entry[k] = num; continue; }
      entry[k] = v;
    }
    if (Object.keys(entry).length === 0) return;
    addSeedEntry(entityName, entry);
    setNewEntry({});
    setAdding(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Seed Data</span>
        <Button variant="ghost" size="icon" onClick={() => setAdding(!adding)}>
          <Plus size={14} />
        </Button>
      </div>

      {seed.length === 0 && !adding && (
        <EmptyState message="No seed entries" />
      )}

      {seed.map((entry, idx) => (
        <div
          key={JSON.stringify(entry)}
          className="rounded border p-2 space-y-1 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Entry {idx + 1}</span>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeSeedEntry(entityName, idx)}
            >
              <Trash2 size={10} />
            </Button>
          </div>
          <div className="space-y-1">
            {Object.entries(entry).map(([key, val]) => (
              <div key={key} className="flex gap-1">
                <span className="text-muted-foreground w-24 truncate">{key}:</span>
                <input
                  type="text"
                  value={String(val)}
                  onChange={(e) => {
                    const updated = { ...entry, [key]: e.target.value };
                    updateSeedEntry(entityName, idx, updated);
                  }}
                  className="flex-1 px-1 py-0.5 text-xs rounded border bg-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {adding && (
        <div className="rounded border p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">New seed entry</span>
            <Button
              variant="ghost"
              className="p-0.5"
              onClick={() => { setAdding(false); setNewEntry({}); }}
            >
              <X size={12} />
            </Button>
          </div>
          {fieldNames.map((fname) => (
            <div key={fname} className="flex gap-1">
              <span className="text-muted-foreground w-24 truncate text-xs">{fname}:</span>
              <Input
                value={newEntry[fname] || ''}
                onChange={(e) => setNewEntry({ ...newEntry, [fname]: e.target.value })}
                placeholder={fields[fname]?.match(/\[([^\]]*)\]/)?.[1] || ''}
                className="flex-1"
              />
            </div>
          ))}
          <Button onClick={handleAdd} className="w-full">
            Add Entry
          </Button>
        </div>
      )}
    </div>
  );
}
