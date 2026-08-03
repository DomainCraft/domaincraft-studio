import { useDomainStore } from '@/stores/domain-store';
import { SPECMETA } from '@/lib/specmeta';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import FormSection from '@/components/ui/FormSection';
import type { RateLimitConfig } from '@/types/domain';

export default function RateLimitSettings() {
  const rateLimit = useDomainStore((s) => s.schema.project.rate_limit);
  const updateProject = useDomainStore((s) => s.updateProject);

  return (
    <FormSection label="Rate Limit">
      <Checkbox
        checked={rateLimit?.enabled ?? false}
        onChange={(checked) =>
          updateProject({
            rate_limit: { ...(rateLimit || {}), enabled: checked },
          })
        }
        label="Enable rate limiting"
      />

      {rateLimit?.enabled && (
        <>
          <Select
            label="Policy"
            value={rateLimit.policy || 'fixed'}
            onChange={(e) =>
              updateProject({
                rate_limit: { ...rateLimit, policy: (e.target.value || undefined) as RateLimitConfig['policy'] },
              })
            }
          >
            {SPECMETA.rateLimitPolicies.map((policy) => (
              <option key={policy} value={policy}>{policy}</option>
            ))}
          </Select>

          <Input
            label="Permit Limit (requests)"
            type="number"
            value={rateLimit.permit_limit || ''}
            onChange={(e) =>
              updateProject({
                rate_limit: { ...rateLimit, permit_limit: e.target.value ? Number(e.target.value) : undefined },
              })
            }
            placeholder="100"
            min={1}
          />

          <Input
            label="Window (seconds)"
            type="number"
            value={rateLimit.window_seconds || ''}
            onChange={(e) =>
              updateProject({
                rate_limit: { ...rateLimit, window_seconds: e.target.value ? Number(e.target.value) : undefined },
              })
            }
            placeholder="60"
            min={1}
          />
        </>
      )}
    </FormSection>
  );
}