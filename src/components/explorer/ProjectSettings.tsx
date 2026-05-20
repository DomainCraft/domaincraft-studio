import { useDomainStore } from '@/stores/domain-store';
import type { DomainSchema } from '@/types/domain';

export default function ProjectSettings() {
  const { schema, updateProject, updateSchemaField } = useDomainStore();
  const { project } = schema;

  return (
    <div className="space-y-4">
      <span className="text-xs font-semibold uppercase text-muted-foreground">Project</span>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Name</label>
          <input
            type="text"
            value={project.name}
            onChange={(e) => updateProject({ name: e.target.value })}
            className="w-full px-2 py-1.5 text-sm rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Description</label>
          <input
            type="text"
            value={project.description || ''}
            onChange={(e) => updateProject({ description: e.target.value || undefined })}
            className="w-full px-2 py-1.5 text-sm rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Version</label>
          <input
            type="text"
            value={project.version || ''}
            onChange={(e) => updateProject({ version: e.target.value || undefined })}
            className="w-full px-2 py-1.5 text-sm rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
            placeholder="1.0.0"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Database</label>
          <select
            value={schema.database || 'postgresql'}
            onChange={(e) => updateSchemaField('database', e.target.value as DomainSchema['database'])}
            className="w-full px-2 py-1.5 text-sm rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite">SQLite</option>
            <option value="mssql">MSSQL</option>
            <option value="mongodb">MongoDB</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Auth</label>
          <input
            type="text"
            value={schema.auth || ''}
            onChange={(e) => updateSchemaField('auth', e.target.value || undefined)}
            className="w-full px-2 py-1.5 text-sm rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
            placeholder="jwt"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">API Style</label>
          <select
            value={schema.api_style || 'rest'}
            onChange={(e) => updateSchemaField('api_style', e.target.value as DomainSchema['api_style'])}
            className="w-full px-2 py-1.5 text-sm rounded border bg-transparent"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <option value="rest">REST</option>
            <option value="graphql">GraphQL</option>
            <option value="grpc">gRPC</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="multi-tenancy"
            checked={project.multi_tenancy?.enabled || false}
            onChange={(e) =>
              updateProject({
                multi_tenancy: { enabled: e.target.checked, mode: e.target.checked ? 'column' : undefined },
              })
            }
            className="rounded"
          />
          <label htmlFor="multi-tenancy" className="text-sm">
            Multi-tenancy
          </label>
        </div>

        {project.multi_tenancy?.enabled && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tenancy Mode</label>
            <select
              value={project.multi_tenancy.mode || 'column'}
              onChange={(e) =>
                updateProject({
                  multi_tenancy: { ...project.multi_tenancy!, mode: e.target.value },
                })
              }
              className="w-full px-2 py-1.5 text-sm rounded border bg-transparent"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <option value="column">Column</option>
              <option value="schema">Schema</option>
              <option value="database">Database</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
