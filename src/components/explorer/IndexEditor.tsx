import { useState } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { SPECMETA } from '@/lib/specmeta';
import { Plus, Trash2, X } from 'lucide-react';
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
    const sort = newIndex.fields.map((_f, i) => newIndex.sort?.[i] || 'asc');
    addIndex(entityName, { ...newIndex, sort });
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

  const setSort = (fieldIndex: number) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewIndex((prev) => {
      const sort = [...(prev.sort || [])];
      sort[fieldIndex] = e.target.value;
      return { ...prev, sort };
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
          key={`${idx.fields.join('-')}-${idx.type}-${idx.unique}-${idx.sort?.join(',')}`}
          className="flex items-center justify-between rounded border px-2 py-1.5 text-xs group"
        >
          <div className="min-w-0">
            <span className="font-medium">{idx.fields.join(', ')}</span>
            {idx.sort && idx.sort.length > 0 && (
              <span className="text-muted-foreground ml-1">({idx.sort.join(',')})</span>
            )}
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

          {newIndex.fields.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block">Sort direction</span>
              {newIndex.fields.map((f, i) => (
                <div key={f} className="flex items-center justify-between gap-2">
                  <span className="text-xs">{f}</span>
                  <Select
                    value={newIndex.sort?.[i] || 'asc'}
                    onChange={setSort(i)}
                    className="w-28"
                  >
                    {SPECMETA.sortDirections.map((dir) => (
                      <option key={dir} value={dir}>{dir}</option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                label="Type"
                value={newIndex.type || 'btree'}
                onChange={(e) => setNewIndex({ ...newIndex, type: e.target.value as IndexDefinition['type'] })}
              >
                {SPECMETA.indexTypes.map((t) => (
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
