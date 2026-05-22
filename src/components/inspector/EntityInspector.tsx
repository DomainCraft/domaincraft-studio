import { useState } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import FieldEditor from './FieldEditor';
import PermissionMatrix from '@/components/permissions/PermissionMatrix';
import { Plus, Trash2, Shield, Trash2Icon, RefreshCw, FileText } from 'lucide-react';
import type { EntityDefinition } from '@/types/domain';

type FeatureId = NonNullable<EntityDefinition['features']>[number];

const featureOptions: { id: FeatureId; label: string; icon: React.ComponentType<{ size?: number }>; color: string }[] = [
  { id: 'audit', label: 'Audit', icon: Shield, color: 'bg-blue-500' },
  { id: 'audit_log', label: 'Audit Log', icon: FileText, color: 'bg-purple-500' },
  { id: 'soft_delete', label: 'Soft Delete', icon: Trash2Icon, color: 'bg-amber-500' },
  { id: 'optimistic_lock', label: 'Optimistic Lock', icon: RefreshCw, color: 'bg-green-500' },
];

const tabs = [
  { id: 'fields' as const, label: 'Fields' },
  { id: 'permissions' as const, label: 'Permissions' },
];

export default function EntityInspector({ entityName }: { entityName: string }) {
  const { schema, updateEntity, addField, removeField, selectedField, selectField } = useDomainStore();
  const entity = schema.entities[entityName];
  const [activeTab, setActiveTab] = useState<'fields' | 'permissions'>('fields');
  const [newFieldName, setNewFieldName] = useState('');
  const [showAddField, setShowAddField] = useState(false);

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

  const handleAddField = () => {
    const name = newFieldName.trim();
    if (!name || fields[name]) return;
    addField(entityName, name, 'string');
    setNewFieldName('');
    setShowAddField(false);
    selectField(name);
  };

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-6 rounded-full bg-blue-500" />
        <h3 className="text-sm font-bold">{entityName}</h3>
      </div>

      {/* Feature badges */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Features</span>
        <div className="flex flex-wrap gap-1.5">
          {featureOptions.map(({ id, label, icon: Icon, color }) => {
            const active = features.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleFeature(id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  active
                    ? `${color} text-white`
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'fields' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Fields</span>
            <button onClick={() => setShowAddField(!showAddField)} className="p-1 rounded hover:bg-accent">
              <Plus size={14} />
            </button>
          </div>

          {showAddField && (
            <div className="flex gap-1">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
                placeholder="Field name..."
                className="flex-1 px-2 py-1 text-xs rounded border bg-transparent"
                style={{ borderColor: 'hsl(var(--border))' }}
                autoFocus
              />
              <button onClick={handleAddField} className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                Add
              </button>
            </div>
          )}

          <div className="space-y-0.5">
            {Object.entries(fields).map(([name, definition]) => (
              <div
                key={name}
                onClick={() => selectField(name)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs group transition-all duration-100 ${
                  selectedField === name
                    ? 'bg-blue-500/10 border-l-2 border-blue-500 pl-1.5'
                    : 'border-l-2 border-transparent hover:bg-accent/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${selectedField === name ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {name}
                  </div>
                  <div className="text-muted-foreground truncate">{definition}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(entityName, name);
                    if (selectedField === name) selectField(null);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {selectedField && fields[selectedField] && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
              <FieldEditor entityName={entityName} fieldName={selectedField} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'permissions' && (
        <PermissionMatrix entityName={entityName} />
      )}
    </div>
  );
}
