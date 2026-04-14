import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
      )}
      {children}
    </button>
  );
}
