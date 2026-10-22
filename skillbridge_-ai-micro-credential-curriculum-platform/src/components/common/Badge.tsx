import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}) => {
  const variantStyles = {
    primary: 'bg-indigo-950/70 text-indigo-300 border-indigo-700/50',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-700/50',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-700/50',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-700/50',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
