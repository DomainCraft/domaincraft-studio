import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'icon';
  children: ReactNode;
}

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'hover:bg-destructive/10 hover:text-destructive',
};

const sizes = {
  sm: 'px-1.5 py-0.5',
  md: 'px-2 py-1',
  icon: 'p-1.5',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const hasCustomPadding = /\bp[trblxy]?-\d/.test(className);
  const sizeClasses = hasCustomPadding ? '' : sizes[size];
  return (
    <button
      className={`rounded font-medium transition-colors text-xs ${variants[variant]} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
