import { useDomainStore } from '@/stores/domain-store';
import { X } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Checkbox from '@/components/ui/Checkbox';
import AddItem from '@/components/ui/AddItem';
import Button from '@/components/ui/Button';
import { PERMISSION_KEYS } from '@/lib/constants';

const crudOps = PERMISSION_KEYS;

export default function PermissionMatrix({ entityName }: { entityName: string }) {
  const entity = useDomainStore((s) => s.schema.entities[entityName]);
  const authRoles = useDomainStore((s) => s.schema.auth?.roles);
  const updateEntity = useDomainStore((s) => s.updateEntity);
  const addRoleToEntity = useDomainStore((s) => s.addRoleToEntity);
  const removeRole = useDomainStore((s) => s.removeRole);
  const permissions = entity?.permissions || {};

  const allRoles = useDomainStore((s) => s.getAllRoles());

  if (!entity) return null;

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
    const role = (roleName || '').trim();
    if (!role || allRoles.includes(role)) return;
    addRoleToEntity(entityName, role);
  };

  const currentAuthRoles = authRoles || [];
  const predefinedRoles = [...new Set([...currentAuthRoles, '*', '@Owner', '@Tenant'])];
  const availableRoles = predefinedRoles.filter((r) => !allRoles.includes(r));

  return (
    <div className="space-y-3">
      <AddItem
        label="Permissions"
        placeholder="Role name..."
        onAdd={(name) => addRole(name)}
        validate={(name) => !allRoles.includes(name)}
      />

      {availableRoles.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableRoles.map((role) => (
            <Button
              key={role}
              variant="ghost"
              size="sm"
              onClick={() => addRole(role)}
              className="border border-border"
            >
              {role}
            </Button>
          ))}
        </div>
      )}

      {allRoles.length === 0 ? (
        <EmptyState message="No permissions defined (public by default)" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-themed">
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
              {allRoles.map((role) => (
                <tr key={role} className="border-b border-themed">
                  <td className="py-1.5 pr-2 font-medium">
                    <span className={role === '*' ? 'text-blue-500' : role.startsWith('@') ? 'text-amber-500' : ''}>
                      {role}
                    </span>
                  </td>
                  {crudOps.map((op) => (
                    <td key={op} className="text-center py-1.5 px-1">
                      <Checkbox
                        checked={(permissions[op] || []).includes(role)}
                        onChange={() => togglePermission(op, role)}
                      />
                    </td>
                  ))}
                  <td>
                    <Button variant="destructive" className="p-0.5" onClick={() => removeRole(role)}>
                      <X size={12} />
                    </Button>
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
        <p><span className="text-amber-500 font-medium">@Tenant</span> = Tenant isolation (multi-tenancy)</p>
      </div>
    </div>
  );
}
