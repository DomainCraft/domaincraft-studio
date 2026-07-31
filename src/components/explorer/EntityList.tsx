import { useState, useMemo } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { Search, Table2 } from 'lucide-react';
import AddItem from '@/components/ui/AddItem';
import SelectableListItem from '@/components/ui/SelectableListItem';

export default function EntityList() {
  const schema = useDomainStore((s) => s.schema);
  const selectedEntity = useDomainStore((s) => s.selectedEntity);
  const selectEntity = useDomainStore((s) => s.selectEntity);
  const addEntity = useDomainStore((s) => s.addEntity);
  const removeEntity = useDomainStore((s) => s.removeEntity);
  const [search, setSearch] = useState('');

  const entityNames = useMemo(() =>
    Object.keys(schema.entities).filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    ),
    [schema.entities, search]
  );

  return (
    <div className="space-y-3">
      <AddItem
        label="Entities"
        placeholder="Entity name..."
        onAdd={(name) => addEntity(name)}
        validate={(name) => !schema.entities[name]}
      />

      <div className="relative">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-7 pr-2 py-1.5 text-xs rounded border bg-transparent"
        />
      </div>

      <div className="space-y-0.5">
        {entityNames.map((name) => {
          const entity = schema.entities[name];
          if (!entity) return null;
          const fieldCount = Object.keys(entity.fields).length;
          const features = entity.features || [];
          const subtitle = `${fieldCount} fields${features.length > 0 ? ` \u00b7 ${features.join(', ')}` : ''}`;

          return (
            <SelectableListItem
              key={name}
              name={name}
              subtitle={subtitle}
              isSelected={selectedEntity === name}
              onClick={() => selectEntity(name)}
              onDelete={() => removeEntity(name)}
              icon={<Table2 size={14} className={selectedEntity === name ? 'text-blue-500' : 'text-muted-foreground'} />}
            />
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
