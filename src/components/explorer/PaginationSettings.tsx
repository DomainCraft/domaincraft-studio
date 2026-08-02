import { useDomainStore } from '@/stores/domain-store';
import Input from '@/components/ui/Input';
import FormSection from '@/components/ui/FormSection';
import type { PaginationConfig } from '@/types/domain';

export default function PaginationSettings() {
  const pagination = useDomainStore((s) => s.schema.project.pagination);
  const updateProject = useDomainStore((s) => s.updateProject);

  const setField = (key: keyof PaginationConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const next: PaginationConfig = { ...(pagination || {}) };
    if (value) next[key] = Number(value);
    else delete next[key];
    updateProject({
      pagination: Object.keys(next).length > 0 ? next : undefined,
    });
  };

  return (
    <FormSection label="Pagination">
      <Input
        label="Default Page Size"
        type="number"
        value={pagination?.default_page_size || ''}
        onChange={setField('default_page_size')}
        placeholder="20"
        min={1}
      />
      <Input
        label="Max Page Size"
        type="number"
        value={pagination?.max_page_size || ''}
        onChange={setField('max_page_size')}
        placeholder="200"
        min={1}
      />
    </FormSection>
  );
}