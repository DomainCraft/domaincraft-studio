import { useDomainStore } from '@/stores/domain-store';
import { SPECMETA } from '@/lib/specmeta';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import FormSection from '@/components/ui/FormSection';
import type { CacheConfig } from '@/types/domain';

export default function CacheSettings() {
  const cache = useDomainStore((s) => s.schema.project.cache);
  const updateProject = useDomainStore((s) => s.updateProject);

  return (
    <FormSection label="Cache">
      <Checkbox
        checked={cache?.enabled || false}
        onChange={(checked) =>
          updateProject({
            cache: { enabled: checked, ...(cache || {}) },
          })
        }
        label="Enable cache"
      />

      {cache?.enabled && (
        <>
          <Select
            label="Provider"
            value={cache.provider || ''}
            onChange={(e) =>
              updateProject({
                cache: { ...cache, provider: (e.target.value || undefined) as CacheConfig['provider'] },
              })
            }
          >
            <option value="">-- Select --</option>
            {SPECMETA.cacheProviders.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </Select>

          <Input
            label="Connection String"
            value={cache.connection_string || ''}
            onChange={(e) =>
              updateProject({
                cache: { ...cache, connection_string: e.target.value || undefined },
              })
            }
            placeholder="redis://localhost:6379"
          />

          <Input
            label="TTL (seconds)"
            type="number"
            value={cache.ttl_seconds || ''}
            onChange={(e) =>
              updateProject({
                cache: { ...cache, ttl_seconds: e.target.value ? Number(e.target.value) : undefined },
              })
            }
            placeholder="300"
            min={0}
          />
        </>
      )}
    </FormSection>
  );
}
