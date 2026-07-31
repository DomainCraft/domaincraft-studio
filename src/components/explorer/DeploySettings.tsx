import { useDomainStore } from '@/stores/domain-store';
import Input from '@/components/ui/Input';
import FormSection from '@/components/ui/FormSection';

export default function DeploySettings() {
  const deploy = useDomainStore((s) => s.schema.project.deploy);
  const updateProject = useDomainStore((s) => s.updateProject);

  return (
    <FormSection label="Deploy">
      <Input
        label="Domain"
        value={deploy?.domain || ''}
        onChange={(e) =>
          updateProject({
            deploy: { ...(deploy || {}), domain: e.target.value || undefined },
          })
        }
        placeholder="localhost"
      />

      <Input
        label="Port"
        type="number"
        value={deploy?.port || ''}
        onChange={(e) =>
          updateProject({
            deploy: { ...(deploy || {}), port: e.target.value ? Number(e.target.value) : undefined },
          })
        }
        placeholder="8080"
        min={1}
        max={65535}
      />
    </FormSection>
  );
}
