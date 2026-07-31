import { useState } from 'react';
import { Plus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface AddItemProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
  validate?: (value: string) => boolean;
}

export default function AddItem({ label, placeholder, onAdd, validate }: AddItemProps) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (validate && !validate(trimmed)) return;
    onAdd(trimmed);
    setValue('');
    setShow(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
        <Button variant="ghost" size="icon" onClick={() => setShow(!show)}>
          <Plus size={14} />
        </Button>
      </div>
      {show && (
        <div className="flex gap-1">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder}
            autoFocus
            className="flex-1"
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
      )}
    </>
  );
}
