import { getFormatValidators } from '@/lib/specmeta';
import Button from '@/components/ui/Button';

interface FormatValidatorProps {
  validations: Record<string, string>;
  onToggle: (key: string) => void;
}

export default function FormatValidator({ validations, onToggle }: FormatValidatorProps) {
  return (
    <div>
      <span className="text-xs text-muted-foreground mb-1 block">Format</span>
      <div className="flex gap-1.5">
        {getFormatValidators().map((key) => (
          <Button
            key={key}
            variant={validations[key] === 'true' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onToggle(key)}
            className={`border ${
              validations[key] === 'true' ? 'border-blue-600' : 'border-border'
            }`}
          >
            {key}
          </Button>
        ))}
      </div>
    </div>
  );
}
