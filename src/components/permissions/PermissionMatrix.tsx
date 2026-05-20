import { useState } from 'react';
import { useDomainStore } from '@/stores/domain-store';
import { Plus, X } from 'lucide-react';

const crudOps = ['read', 'create', 'update', 'delete'] as const;

export default function PermissionMatrix({ entityName }: { entityName: string }) {
  const { schema, updateEntity } = useDomainStore();
  const entity = schema.entities[entityName];
  const permissions = entity?.permissions || {};
  const [newRole, setNewRole] = useState('');
  const [showAddRole, setShowAddRole] = useState(false);

  if (!entity) return null;

  // Collect roles from ALL entities (global roles)
  const allRoles = new Set<string>();
  Object.values(schema.entities).forEach((ent) => {
    crudOps.forEach((op) => {
      (ent.permissions?.[op] || []).forEach((role) => allRoles.add(role));
    });
  });
  const roles = Array.from(allRoles).sort();

  const togglePermission = (op: typeof crudOps[number], role: string) => {
    const current = permissions[op] || [];
    let next: string[];
    if (current.includes(role)) {
      next = current.filter((r) => r !== role);
    } else {
      next = [...current, role];
    }
    updateEntity(entityName, {
      permissions: { ...permissions, [op]: next },
    });
  };

  const addRole = (roleName?: string) => {
    const role = (roleName || newRole).trim();
    if (!role || roles.includes(role)) return;
    // Add role to this entity's read permission as starting point
    updateEntity(entityName, {
      permissions: { ...permissions, read: [...(permissions.read || []), role] },
    });
    setNewRole('');
    setShowAddRole(false);
  };

  const removeRole = (role: string) => {
    // Remove role from ALL entities
    Object.entries(schema.entities).forEach(([name, ent]) => {
      if (!ent.permissions) return;
      const next = { ...ent.permissions };
      let changed = false;
      crudOps.forEach((op) => {
        const filtered = (next[op] || []).filter((r) => r !== role);
        if (filtered.length !== (next[op] || []).length) {
          next[op] = filtered;
          changed = true;
        }
      });
      if (changed) {
        updateEntity(name, { permissions: next });
      }
    });
  };

  const predefinedRoles = ['Admin', 'Editor', 'User', 'Guest', '*', '@Owner'];
  const availableRoles = predefinedRoles.filter((r) => !roles.includes(r));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">Permissions</span>
        <button onClick={() => setShowAddRole(!showAddRole)} className="p-1 rounded hover:bg-accent">
          <Plus size={14} />
        </button>
      </div>

      {showAddRole && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRole()}
              placeholder="Role name..."
              className="flex-1 px-2 py-1 text-xs rounded border bg-transparent"
              style={{ borderColor: 'hsl(var(--border))' }}
              autoFocus
            />
            <button onClick={() => addRole()} className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
              Add
            </button>
          </div>
          {availableRoles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => addRole(role)}
                  className="px-1.5 py-0.5 text-xs rounded border hover:bg-accent"
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {roles.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4">
          No permissions defined (public by default)
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                <th className="text-left py-1.5 pr-2 font-medium text-muted-foreground">Role</th>
                {crudOps.map((op) => (
                  <th key={op} className="text-center py-1.5 px-1 font-medium text-muted-foreground capitalize">
                    {op}
                  </th>
                ))}
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role} className="border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                  <td className="py-1.5 pr-2 font-medium">
                    <span className={role === '*' ? 'text-blue-500' : role.startsWith('@') ? 'text-amber-500' : ''}>
                      {role}
                    </span>
                  </td>
                  {crudOps.map((op) => (
                    <td key={op} className="text-center py-1.5 px-1">
                      <input
                        type="checkbox"
                        checked={(permissions[op] || []).includes(role)}
                        onChange={() => togglePermission(op, role)}
                        className="rounded"
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => removeRole(role)} className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive">
                      <X size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1 pt-2">
        <p><span className="text-blue-500 font-medium">*</span> = Public (AllowAnonymous)</p>
        <p><span className="text-amber-500 font-medium">@Owner</span> = Resource owner check</p>
      </div>
    </div>
  );
}
