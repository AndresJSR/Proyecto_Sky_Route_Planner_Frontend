import type { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  label: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export function Badge({
  label,
  variant = 'info',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const variantStyles = {
    info: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-danger/10 text-danger',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {label}
    </span>
  );
}

export default Badge;
