import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, children, className = '', ...props }, ref) => {
  const base = 'w-full px-2 py-1.5 text-xs rounded border bg-transparent';
  return label ? (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <select ref={ref} className={`${base} ${className}`} {...props}>
        {children}
      </select>
    </div>
  ) : (
    <select ref={ref} className={`${base} ${className}`} {...props}>
      {children}
    </select>
  );
});

Select.displayName = 'Select';
export default Select;
