import { useDomainStore } from '@/stores/domain-store';
import EntityInspector from './EntityInspector';

export default function Inspector() {
  const selectedEntity = useDomainStore((s) => s.selectedEntity);
  const entityExists = useDomainStore((s) => s.selectedEntity !== null && s.schema.entities[s.selectedEntity] !== undefined);

  if (!entityExists) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
        Select an entity on the canvas or in the explorer to inspect its properties
      </div>
    );
  }

  return <EntityInspector entityName={selectedEntity!} />;
}
