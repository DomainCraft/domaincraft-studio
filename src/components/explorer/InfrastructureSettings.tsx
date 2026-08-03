import { useDomainStore } from '@/stores/domain-store';
import { SPECMETA } from '@/lib/specmeta';
import Select from '@/components/ui/Select';
import FormSection from '@/components/ui/FormSection';
import type { InfrastructureConfig } from '@/types/domain';

interface Section {
  key: keyof InfrastructureConfig;
  label: string;
  placeholder: string;
  options: readonly string[];
}

export default function InfrastructureSettings() {
  const infra = useDomainStore((s) => s.schema.project.infrastructure);
  const updateProject = useDomainStore((s) => s.updateProject);

  const sections: Section[] = [
    { key: 'queue', label: 'Message Queue', placeholder: 'pubsub', options: SPECMETA.infraQueues },
    { key: 'cache', label: 'Distributed Cache', placeholder: 'redis', options: SPECMETA.infraCacheStores },
    { key: 'secrets', label: 'Secrets Store', placeholder: 'local', options: SPECMETA.infraSecretStores },
    { key: 'storage', label: 'Object Storage', placeholder: 'local', options: SPECMETA.infraStores },
  ];

  const setField = (key: keyof InfrastructureConfig) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || undefined;
    const next: InfrastructureConfig = { ...(infra || {}) };
    if (value) next[key] = value as never;
    else delete next[key];
    updateProject({
      infrastructure: Object.keys(next).length > 0 ? next : undefined,
    });
  };

  return (
    <FormSection label="Infrastructure">
      <p className="text-xs text-muted-foreground">
        Declared infrastructure accelerators (queue, cache, secrets, storage).
      </p>
      {sections.map(({ key, label, placeholder, options }) => (
        <Select
          key={key}
          label={label}
          value={infra?.[key] || ''}
          onChange={setField(key)}
        >
          <option value="">None</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt === placeholder ? `${opt} (default)` : opt}</option>
          ))}
        </Select>
      ))}
    </FormSection>
  );
}