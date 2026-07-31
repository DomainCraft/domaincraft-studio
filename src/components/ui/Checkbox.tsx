interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export default function Checkbox({ checked, onChange, label, className = '' }: CheckboxProps) {
  const input = (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded"
    />
  );

  if (!label) return input;

  return (
    <label className={`flex items-center gap-2 text-xs ${className}`}>
      {input}
      {label}
    </label>
  );
}
