import { Key, Link, Hash, Type, ToggleLeft, Calendar, FileText, List } from 'lucide-react';
import type { ComponentType } from 'react';
import type { ParsedField } from '@/types/domain';

export function getTypeIcon(type: string): ComponentType<{ size?: number; className?: string }> {
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

export function formatFieldType(field: ParsedField): string {
  if (field.type === 'relation') return `\u2192 ${field.target}`;
  if (field.type === 'enum') return field.target || 'enum';
  const base = field.type;
  return field.isArray ? `${base}[]` : base;
}
