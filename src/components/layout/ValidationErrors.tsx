import { useState } from 'react';
import { useValidationErrors } from '@/hooks/useValidationErrors';
import { AlertTriangle, XCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ValidationErrors() {
  const { hardErrors, warnings, wasmLoading } = useValidationErrors();
  const [expanded, setExpanded] = useState(false);

  if (hardErrors.length === 0 && warnings.length === 0 && !wasmLoading) return null;

  return (
    <div className="border-t border-themed shrink-0 bg-themed-card">
      {wasmLoading && hardErrors.length === 0 && warnings.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
          <Loader2 size={12} className="animate-spin" />
          <span>Loading WASM validator...</span>
        </div>
      )}

      {(hardErrors.length > 0 || warnings.length > 0) && (
        <Button
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-none hover:bg-accent/50"
        >
          {hardErrors.length > 0 ? (
            <XCircle size={14} className="text-red-500 shrink-0" />
          ) : (
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          )}
          <span className="font-medium">
            {hardErrors.length > 0
              ? `${hardErrors.length} error${hardErrors.length !== 1 ? 's' : ''}`
              : `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`
            }
          </span>
          <span className="text-muted-foreground">
            {hardErrors.length > 0 && warnings.length > 0
              ? `(${warnings.length} warning${warnings.length !== 1 ? 's' : ''})`
              : ''}
          </span>
          <div className="flex-1" />
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </Button>
      )}

      {expanded && (
        <div className="max-h-40 overflow-y-auto border-t border-themed px-3 py-1.5 space-y-1">
          {hardErrors.map((e, i) => (
            <div key={`err-${i}`} className="flex gap-2 text-xs">
              <XCircle size={12} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-red-400">{e.path}</span>
                <span className="mx-1 text-muted-foreground">-</span>
                <span>{e.message}</span>
              </div>
            </div>
          ))}
          {warnings.map((e, i) => (
            <div key={`warn-${i}`} className="flex gap-2 text-xs">
              <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-amber-400">{e.path}</span>
                <span className="mx-1 text-muted-foreground">-</span>
                <span>{e.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
