import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...props }, ref) => {
  const base = 'w-full px-2 py-1.5 text-xs rounded border bg-transparent outline-none focus:ring-1 focus:ring-blue-500/50';
  return label ? (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input ref={ref} className={`${base} ${className}`} {...props} />
    </div>
  ) : (
    <input ref={ref} className={`${base} ${className}`} {...props} />
  );
});

Input.displayName = 'Input';
export default Input;
