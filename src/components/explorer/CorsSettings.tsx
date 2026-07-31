import { useDomainStore } from '@/stores/domain-store';
import Checkbox from '@/components/ui/Checkbox';
import FormSection from '@/components/ui/FormSection';
import TagInput from '@/components/ui/TagInput';

export default function CorsSettings() {
  const cors = useDomainStore((s) => s.schema.project.cors);
  const updateProject = useDomainStore((s) => s.updateProject);

  return (
    <FormSection label="CORS">
      <Checkbox
        checked={cors?.enabled || false}
        onChange={(checked) =>
          updateProject({
            cors: { enabled: checked, origins: cors?.origins },
          })
        }
        label="Enable CORS"
      />

      {cors?.enabled && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Origins</label>
          <TagInput
            tags={cors.origins || []}
            onChange={(origins) =>
              updateProject({
                cors: { ...cors, origins: origins.length > 0 ? origins : undefined },
              })
            }
            placeholder="http://localhost:3000"
          />
        </div>
      )}
    </FormSection>
  );
}
