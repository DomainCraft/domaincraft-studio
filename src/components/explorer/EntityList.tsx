import { useState } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { Plus, Trash2, Search, Table2 } from 'lucide-react';

export default function EntityList() {
  const { schema, selectedEntity, selectEntity, addEntity, removeEntity } = useDomainStore();
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const entityNames = Object.keys(schema.entities).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (schema.entities[name]) return;
    addEntity(name);
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Entities</span>
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
            placeholder="Entity name..."
            className="flex-1 px-2 py-1 text-xs rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
            autoFocus
          />
          <button onClick={handleAdd} className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
            Add
          </button>
        </div>
      )}

      <div className="relative">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-7 pr-2 py-1.5 text-xs rounded border bg-transparent"
          style={{ borderColor: 'hsl(var(--border))' }}
        />
      </div>

      <div className="space-y-0.5">
        {entityNames.map((name) => {
          const entity = schema.entities[name];
          const fieldCount = Object.keys(entity.fields).length;
          const features = entity.features || [];

          return (
            <div
              key={name}
              onClick={() => selectEntity(name)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm group transition-all duration-100 ${
                selectedEntity === name
                  ? 'bg-blue-500/10 border-l-2 border-blue-500 pl-1'
                  : 'border-l-2 border-transparent hover:bg-accent/50'
              }`}
            >
              <Table2 size={14} className={selectedEntity === name ? 'text-blue-500' : 'text-muted-foreground'} />
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${selectedEntity === name ? 'text-blue-600 dark:text-blue-400' : ''}`}>{name}</div>
                <div className="text-xs text-muted-foreground">
                  {fieldCount} fields
                  {features.length > 0 && ` · ${features.join(', ')}`}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeEntity(name);
                }}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}

        {entityNames.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-4">
            {search ? 'No matches' : 'No entities yet'}
          </div>
        )}
      </div>
    </div>
  );
}
