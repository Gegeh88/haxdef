interface BadgeProps {
  variant: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning' | 'default';
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  const variants = {
    critical: 'bg-red-900/50 text-red-400 border-red-800',
    high: 'bg-orange-900/50 text-orange-400 border-orange-800',
    medium: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
    low: 'bg-blue-900/50 text-blue-400 border-blue-800',
    info: 'bg-gray-800/50 text-gray-400 border-gray-700',
    success: 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
    warning: 'bg-amber-900/50 text-amber-400 border-amber-800',
    default: 'bg-gray-800/50 text-gray-400 border-gray-700',
  };

  return (
    <span className={`${variants[variant]} text-xs font-medium px-2.5 py-0.5 rounded-full border inline-block`}>
      {children}
    </span>
  );
}
