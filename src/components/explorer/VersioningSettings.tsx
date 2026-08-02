import { useDomainStore } from '@/stores/domain-store';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import FormSection from '@/components/ui/FormSection';

export default function VersioningSettings() {
  const versioning = useDomainStore((s) => s.schema.project.versioning);
  const updateProject = useDomainStore((s) => s.updateProject);

  return (
    <FormSection label="API Versioning">
      <Checkbox
        checked={versioning?.enabled ?? false}
        onChange={(checked) =>
          updateProject({
            versioning: { ...(versioning || {}), enabled: checked },
          })
        }
        label="Enable API versioning"
      />

      {versioning?.enabled && (
        <Input
          label="Default Version"
          value={versioning.default_version || ''}
          onChange={(e) =>
            updateProject({
              versioning: { ...versioning, default_version: e.target.value || undefined },
            })
          }
          placeholder="1.0"
        />
      )}
    </FormSection>
  );
}