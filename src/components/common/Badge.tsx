import React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  status?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'sm',
  pulse = false,
  className = '',
}) => {
  // Determine variant if status is provided
  let effectiveVariant = variant || 'neutral';
  if (!variant && status) {
    const s = status.toLowerCase();
    if (s.includes('avail') || s.includes('active') || s.includes('resolve') || s.includes('verif') || s.includes('approv')) {
      effectiveVariant = 'success';
    } else if (s.includes('maint') || s.includes('pend') || s.includes('warn') || s.includes('progr')) {
      effectiveVariant = 'warning';
    } else if (s.includes('lost') || s.includes('miss') || s.includes('damag') || s.includes('overdue') || s.includes('reject') || s.includes('critical')) {
      effectiveVariant = 'danger';
    } else if (s.includes('reserv') || s.includes('upcom') || s.includes('transf')) {
      effectiveVariant = 'info';
    }
  }

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded border ${variantStyles[effectiveVariant]} ${sizeStyles[size]} ${className}`}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />}
      {children || status}
    </span>
  );
};

export const Badge = StatusBadge;

export const MetadataText: React.FC<{
  label: string;
  value: string | number;
  separator?: boolean;
}> = ({ label, value, separator = false }) => {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className="text-slate-400 font-normal">{label}:</span>
      <span className="font-medium text-slate-700">{value}</span>
      {separator && <span className="text-slate-300 ml-1">·</span>}
    </span>
  );
};
