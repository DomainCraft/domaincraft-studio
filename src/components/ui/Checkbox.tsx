interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  hint?: string;
}

export default function Checkbox({ checked, onChange, label, className = '', disabled = false, hint }: CheckboxProps) {
  const input = (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded disabled:opacity-40"
      title={disabled ? hint : undefined}
    />
  );

  if (!label) return input;

  return (
    <label className={`flex items-center gap-2 text-xs ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {input}
      {label}
    </label>
  );
}
