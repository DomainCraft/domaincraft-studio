import { useDomainStore } from '@/stores/domain-store';
import { DATABASES, API_STYLES, MULTI_TENANCY_MODES } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import FormSection from '@/components/ui/FormSection';
import AuthSettings from './AuthSettings';
import CacheSettings from './CacheSettings';
import CorsSettings from './CorsSettings';
import DeploySettings from './DeploySettings';
import type { DomainSchema, MultiTenancy } from '@/types/domain';

export default function ProjectSettings() {
  const project = useDomainStore((s) => s.schema.project);
  const database = useDomainStore((s) => s.schema.database);
  const api_style = useDomainStore((s) => s.schema.api_style);
  const updateProject = useDomainStore((s) => s.updateProject);
  const updateSchemaField = useDomainStore((s) => s.updateSchemaField);

  return (
    <div className="space-y-5">
      <FormSection label="Project">
        <Input
          label="Name"
          value={project.name}
          onChange={(e) => updateProject({ name: e.target.value })}
        />

        <Input
          label="Description"
          value={project.description || ''}
          onChange={(e) => updateProject({ description: e.target.value || undefined })}
          placeholder="Optional"
        />

        <Input
          label="Version"
          value={project.version || ''}
          onChange={(e) => updateProject({ version: e.target.value || undefined })}
          placeholder="1.0.0"
        />

        <Input
          label="Platform"
          value={project.platform || ''}
          onChange={(e) => updateProject({ platform: e.target.value || undefined })}
          placeholder="e.g. net9.0"
        />

        <Select
          label="Database"
          value={database || 'postgresql'}
          onChange={(e) => updateSchemaField('database', e.target.value as DomainSchema['database'])}
        >
          {DATABASES.map((db) => (
            <option key={db} value={db}>{db}</option>
          ))}
        </Select>

        <Select
          label="API Style"
          value={api_style || 'rest'}
          onChange={(e) => updateSchemaField('api_style', e.target.value as DomainSchema['api_style'])}
        >
          {API_STYLES.map((style) => (
            <option key={style} value={style}>{style}</option>
          ))}
        </Select>
      </FormSection>

      <AuthSettings />

      <FormSection label="Multi-tenancy">
        <Checkbox
          checked={project.multi_tenancy?.enabled || false}
          onChange={(checked) =>
            updateProject({
              multi_tenancy: { enabled: checked, mode: checked ? 'column' : undefined },
            })
          }
          label="Enable multi-tenancy"
        />

        {project.multi_tenancy?.enabled && (
          <Select
            label="Mode"
            value={project.multi_tenancy.mode || 'column'}
            onChange={(e) =>
              updateProject({
                multi_tenancy: { enabled: true, ...project.multi_tenancy, mode: e.target.value as MultiTenancy['mode'] },
              })
            }
          >
            {MULTI_TENANCY_MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </Select>
        )}
      </FormSection>

      <CacheSettings />
      <CorsSettings />
      <DeploySettings />
    </div>
  );
}
