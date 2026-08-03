import { useState, useCallback } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import FieldEditor from './FieldEditor';
import PermissionMatrix from '@/components/permissions/PermissionMatrix';
import SeedEditor from '@/components/seed/SeedEditor';
import IndexEditor from '@/components/explorer/IndexEditor';
import { Pencil } from 'lucide-react';
import { getFeatureOptions, type FeatureId } from '@/lib/features';
import { featureIcons } from '@/lib/feature-icons';
import TabBar from '@/components/ui/TabBar';
import AddItem from '@/components/ui/AddItem';
import SelectableListItem from '@/components/ui/SelectableListItem';
import Button from '@/components/ui/Button';

const tabs = [
  { id: 'fields', label: 'Fields' },
  { id: 'indexes', label: 'Indexes' },
  { id: 'seed', label: 'Seed' },
  { id: 'permissions', label: 'Permissions' },
];

export default function EntityInspector({ entityName }: { entityName: string }) {
  const entity = useDomainStore((s) => s.schema.entities[entityName]);
  const updateEntity = useDomainStore((s) => s.updateEntity);
  const renameEntity = useDomainStore((s) => s.renameEntity);
  const addField = useDomainStore((s) => s.addField);
  const removeField = useDomainStore((s) => s.removeField);
  const selectedField = useDomainStore((s) => s.selectedField);
  const selectField = useDomainStore((s) => s.selectField);

  const [activeTab, setActiveTab] = useState('fields');
  const [editingName, setEditingName] = useState(false);
  const [renameValue, setRenameValue] = useState(entityName);
  const featureOptions = getFeatureOptions();

  const hasConflict = useDomainStore(
    useCallback(
      (s) => renameValue !== entityName && renameValue in s.schema.entities,
      [renameValue, entityName]
    )
  );

  if (!entity) return null;

  const features = entity.features || [];
  const fields = entity.fields || {};

  const toggleFeature = (feature: FeatureId) => {
    const current = features || [];
    if (current.includes(feature)) {
      updateEntity(entityName, { features: current.filter((f) => f !== feature) });
    } else {
      updateEntity(entityName, { features: [...current, feature] });
    }
  };

  const handleAddField = (name: string) => {
    if (fields[name]) return;
    addField(entityName, name, 'string');
    selectField(name);
  };

  const handleRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== entityName && !hasConflict) {
      renameEntity(entityName, trimmed);
    }
    setEditingName(false);
  };

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center gap-2 group">
        <div className="w-1.5 h-6 rounded-full bg-blue-500" />
        {editingName ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
            className="text-sm font-bold bg-transparent border-b border-blue-500 outline-none"
            autoFocus
          />
        ) : (
          <h3
            className="text-sm font-bold cursor-pointer hover:text-blue-400 transition-colors"
            onClick={() => { setEditingName(true); setRenameValue(entityName); }}
          >
            {entityName}
          </h3>
        )}
        {!editingName && (
          <Button
            variant="ghost"
            className="p-0.5 opacity-0 group-hover:opacity-100"
            onClick={() => { setEditingName(true); setRenameValue(entityName); }}
          >
            <Pencil size={10} />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Features</span>
        <div className="flex flex-wrap gap-1.5">
          {featureOptions.map(({ id, label, color }) => {
            const active = features.includes(id);
            const Icon = featureIcons[id];
            return (
              <Button
                key={id}
                variant="ghost"
                onClick={() => toggleFeature(id)}
                className={`flex items-center gap-1 px-2 py-1 font-medium ${
                  active
                    ? `${color} text-white`
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                <Icon size={12} />
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'fields' && (
        <div className="space-y-2">
          <AddItem
            label="Fields"
            placeholder="Field name..."
            onAdd={handleAddField}
            validate={(name) => !fields[name]}
          />

          <div className="space-y-0.5">
            {Object.entries(fields).map(([name, definition]) => (
              <SelectableListItem
                key={name}
                name={name}
                subtitle={definition}
                isSelected={selectedField === name}
                onClick={() => selectField(name)}
                onDelete={() => {
                  removeField(entityName, name);
                  if (selectedField === name) selectField(null);
                }}
              />
            ))}
          </div>

          {selectedField && fields[selectedField] && (
            <div className="mt-3 pt-3 border-t border-themed">
              <FieldEditor entityName={entityName} fieldName={selectedField} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'indexes' && (
        <IndexEditor entityName={entityName} />
      )}

      {activeTab === 'seed' && (
        <SeedEditor entityName={entityName} />
      )}

      {activeTab === 'permissions' && (
        <PermissionMatrix entityName={entityName} />
      )}
    </div>
  );
}
