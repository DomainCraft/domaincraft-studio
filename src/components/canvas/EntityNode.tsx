import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Key, Link, Lock, Hash, Type, ToggleLeft, Calendar, FileText, List, Shield, Trash2, RefreshCw } from 'lucide-react';
import type { ParsedField } from '@/types/domain';

const featureIcons: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; color: string }> = {
  audit: { icon: Shield, label: 'Audit', color: 'bg-blue-500' },
  audit_log: { icon: FileText, label: 'Audit Log', color: 'bg-purple-500' },
  soft_delete: { icon: Trash2, label: 'Soft Delete', color: 'bg-amber-500' },
  optimistic_lock: { icon: RefreshCw, label: 'Optimistic Lock', color: 'bg-green-500' },
};

function getTypeIcon(type: string) {
  switch (type) {
    case 'uuid': return Key;
    case 'relation': return Link;
    case 'string':
    case 'text': return Type;
    case 'int':
    case 'bigint':
    case 'float':
    case 'decimal': return Hash;
    case 'boolean': return ToggleLeft;
    case 'date':
    case 'datetime': return Calendar;
    case 'json':
    case 'jsonb': return FileText;
    case 'enum': return List;
    default: return Type;
  }
}

function formatFieldType(field: ParsedField): string {
  if (field.type === 'relation') return `→ ${field.target}`;
  if (field.type === 'enum') return field.target || 'enum';
  const base = field.type;
  return field.isArray ? `${base}[]` : base;
}

interface EntityNodeData {
  name: string;
  fields: ParsedField[];
  features: string[];
  selectedEntity?: string | null;
  [key: string]: unknown;
}

function EntityNode({ data, selected }: NodeProps & { data: EntityNodeData }) {
  const { name, fields = [], features = [], selectedEntity } = data;
  const activeFeatures = features.filter(f => featureIcons[f]);
  const isSelected = selected || selectedEntity === name;

  return (
    <div
      className={`entity-card rounded-lg shadow-lg min-w-[220px] max-w-[300px] transition-all duration-150 backdrop-blur-sm ${
        isSelected
          ? 'border-2 border-blue-500 bg-popover ring-2 ring-blue-500/30'
          : 'border border-border bg-popover/95 hover:border-muted-foreground/30'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />

      <div className={`rounded-t-lg px-3 py-2 flex items-center gap-2 ${
        isSelected ? 'bg-blue-500/10' : 'bg-muted'
      }`}>
        <span className="font-bold text-foreground text-sm truncate">{name}</span>
        <div className="flex gap-1 ml-auto">
          {activeFeatures.map(feat => {
            const config = featureIcons[feat];
            const Icon = config.icon;
            return (
              <span
                key={feat}
                title={config.label}
                className={`${config.color} rounded p-0.5 flex items-center justify-center`}
              >
                <Icon size={12} className="text-white" />
              </span>
            );
          })}
        </div>
      </div>

      <div className="px-2 py-1.5 space-y-0.5 max-h-[250px] overflow-y-auto scrollbar-thin">
        {fields.map(field => {
          const TypeIcon = getTypeIcon(field.type);
          const isPrimary = field.validations?.primary === 'true';
          const isHidden = field.validations?.hidden === 'true';
          const isRelation = field.type === 'relation';

          return (
            <div
              key={field.name}
              className="flex items-center gap-1.5 text-xs py-0.5 px-1 rounded hover:bg-muted/50"
            >
              {isPrimary ? (
                <Key size={12} className="text-yellow-500 shrink-0" />
              ) : isHidden ? (
                <Lock size={12} className="text-red-500 shrink-0" />
              ) : (
                <TypeIcon size={12} className="text-muted-foreground shrink-0" />
              )}

              <span className={`truncate ${isPrimary ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-foreground'}`}>
                {field.name}
              </span>

              {field.validations?.required === 'true' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Required" />
              )}

              <span className={`ml-auto truncate text-[10px] ${
                isRelation ? 'text-blue-500' : 'text-muted-foreground'
              }`}>
                {formatFieldType(field)}
              </span>
            </div>
          );
        })}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
    </div>
  );
}

export default memo(EntityNode);
