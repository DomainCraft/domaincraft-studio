import { useDomainStore } from '@/stores/domain-store';
import { useShallow } from 'zustand/react/shallow';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import FormSection from '@/components/ui/FormSection';
import TagInput from '@/components/ui/TagInput';

export default function AuthSettings() {
  const auth = useDomainStore((s) => s.schema.auth);
  const entityNames = useDomainStore(
    useShallow((s) => Object.keys(s.schema.entities))
  );
  const updateAuth = useDomainStore((s) => s.updateAuth);

  return (
    <FormSection label="Auth">
      <Select
        label="Type"
        value={auth?.type || 'none'}
        onChange={(e) => updateAuth({ type: e.target.value as 'jwt' | 'none' })}
      >
        <option value="jwt">JWT</option>
        <option value="none">None</option>
      </Select>

      {auth?.type !== 'none' && (
        <>
          <Select
            label="Auth Entity"
            value={auth?.entity || ''}
            onChange={(e) => updateAuth({ entity: e.target.value || undefined })}
          >
            <option value="">-- Auto-detect --</option>
            {entityNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Roles</label>
            <TagInput
              tags={auth?.roles || []}
              onChange={(roles) => updateAuth({ roles: roles.length > 0 ? roles : undefined })}
              placeholder="Add role..."
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Endpoints</span>
            <div className="flex gap-3">
              {(['login', 'register', 'me'] as const).map((ep) => (
                <Checkbox
                  key={ep}
                  checked={auth?.endpoints?.[ep] !== false}
                  onChange={(checked) => updateAuth({
                    endpoints: { ...auth?.endpoints, [ep]: checked },
                  })}
                  label={ep}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </FormSection>
  );
}
