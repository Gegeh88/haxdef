import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ padding = 'md', children, className = '', ...props }: CardProps) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-xl ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
