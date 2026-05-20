import { useDomainStore } from '@/stores/domain-store';
import EntityInspector from './EntityInspector';

export default function Inspector() {
  const selectedEntity = useDomainStore((s) => s.selectedEntity);
  const schema = useDomainStore((s) => s.schema);

  if (!selectedEntity || !schema.entities[selectedEntity]) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
        Select an entity on the canvas or in the explorer to inspect its properties
      </div>
    );
  }

  return <EntityInspector entityName={selectedEntity} />;
}
