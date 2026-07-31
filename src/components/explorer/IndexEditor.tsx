import { useState } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { Plus, Trash2, X } from 'lucide-react';
import { INDEX_TYPES } from '@/lib/constants';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { IndexDefinition } from '@/types/domain';

interface Props {
  entityName: string;
}

export default function IndexEditor({ entityName }: Props) {
  const entity = useDomainStore((s) => s.schema.entities[entityName]);
  const addIndex = useDomainStore((s) => s.addIndex);
  const removeIndex = useDomainStore((s) => s.removeIndex);
  const indexes = entity?.indexes || [];
  const fieldNames = Object.keys(entity?.fields || {});
  const [adding, setAdding] = useState(false);
  const [newIndex, setNewIndex] = useState<IndexDefinition>({ fields: [], type: 'btree' });

  const handleAdd = () => {
    if (newIndex.fields.length === 0) return;
    addIndex(entityName, { ...newIndex });
    setNewIndex({ fields: [], type: 'btree' });
    setAdding(false);
  };

  const toggleField = (field: string) => {
    setNewIndex((prev) => {
      const fields = prev.fields.includes(field)
        ? prev.fields.filter((f) => f !== field)
        : [...prev.fields, field];
      return { ...prev, fields };
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Indexes</span>
        <Button variant="ghost" size="icon" onClick={() => setAdding(!adding)}>
          <Plus size={14} />
        </Button>
      </div>

      {indexes.length === 0 && !adding && (
        <EmptyState message="No indexes" />
      )}

      {indexes.map((idx, i) => (
        <div
          key={`${idx.fields.join('-')}-${idx.type}-${idx.unique}`}
          className="flex items-center justify-between rounded border px-2 py-1.5 text-xs group"
        >
          <div className="min-w-0">
            <span className="font-medium">{idx.fields.join(', ')}</span>
            {idx.type && idx.type !== 'btree' && (
              <span className="text-muted-foreground ml-1">({idx.type})</span>
            )}
            {idx.unique && <span className="text-blue-400 ml-1">unique</span>}
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => removeIndex(entityName, i)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={10} />
          </Button>
        </div>
      ))}

      {adding && (
        <div className="rounded border p-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">New index</span>
            <Button
              variant="ghost"
              className="p-0.5"
              onClick={() => { setAdding(false); setNewIndex({ fields: [], type: 'btree' }); }}
            >
              <X size={12} />
            </Button>
          </div>

          <div>
            <span className="text-xs text-muted-foreground mb-1 block">Fields</span>
            <div className="flex flex-wrap gap-1">
              {fieldNames.map((f) => (
                <Button
                  key={f}
                  variant={newIndex.fields.includes(f) ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => toggleField(f)}
                  className={`border ${
                    newIndex.fields.includes(f) ? 'border-blue-600' : 'border-border'
                  }`}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                label="Type"
                value={newIndex.type || 'btree'}
                onChange={(e) => setNewIndex({ ...newIndex, type: e.target.value as IndexDefinition['type'] })}
              >
                {INDEX_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <Checkbox
              checked={newIndex.unique || false}
              onChange={(checked) => setNewIndex({ ...newIndex, unique: checked || undefined })}
              label="Unique"
              className="mt-4"
            />
          </div>

          <Button
            onClick={handleAdd}
            disabled={newIndex.fields.length === 0}
            className="w-full disabled:opacity-50"
          >
            Add Index
          </Button>
        </div>
      )}
    </div>
  );
}
