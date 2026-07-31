import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface SelectableListItemProps {
  name: string;
  subtitle?: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
  icon?: ReactNode;
}

export default function SelectableListItem({
  name,
  subtitle,
  isSelected,
  onClick,
  onDelete,
  icon,
}: SelectableListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs group transition-all duration-100 ${
        isSelected
          ? 'bg-blue-500/10 border-l-2 border-blue-500 pl-1.5'
          : 'border-l-2 border-transparent hover:bg-accent/50'
      }`}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
          {name}
        </div>
        {subtitle && (
          <div className="text-muted-foreground truncate">{subtitle}</div>
        )}
      </div>
      {onDelete && (
        <Button
          variant="destructive"
          className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 size={12} />
        </Button>
      )}
    </div>
  );
}
