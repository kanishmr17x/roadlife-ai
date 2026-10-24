import React from 'react';
import { DamageSeverity } from '../../constants/status';
import { THEME_CONFIG } from '../../config/theme';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'severity' | 'status' | 'default' | 'demo' | 'live' | 'forest' | 'terracotta';
  severity?: DamageSeverity;
  status?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  severity,
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  if (variant === 'severity' && severity) {
    const config = THEME_CONFIG.severityColors[severity] || THEME_CONFIG.severityColors.LOW;
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {children || config.label || severity}
      </span>
    );
  }

  if (variant === 'status' && status) {
    const key = status as keyof typeof THEME_CONFIG.statusColors;
    const config = THEME_CONFIG.statusColors[key] || THEME_CONFIG.statusColors.REPORTED;
    return (
      <span
        className={`inline-flex items-center font-medium rounded border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      >
        {children || status.replace('_', ' ')}
      </span>
    );
  }

  if (variant === 'demo') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider rounded border bg-[#F5F3EC] text-[#6F726A] border-[#D8D7CE] ${sizeClasses} ${className}`}
        title="Field Demonstration Seed Record"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#78846A]" />
        Sample Data
      </span>
    );
  }

  if (variant === 'live') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider rounded border bg-[#EDF3EE] text-[#355844] border-[#C6D8CC] ${sizeClasses} ${className}`}
        title="Live Municipal Database Connection"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#355844]" />
        Live Database
      </span>
    );
  }

  if (variant === 'forest') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded border bg-[#EDF3EE] text-[#355844] border-[#C6D8CC] ${sizeClasses} ${className}`}
      >
        {children}
      </span>
    );
  }

  if (variant === 'terracotta') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded border bg-[#FBF0EC] text-[#B9684D] border-[#ECC4B8] ${sizeClasses} ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded border bg-[#FFFEFA] text-[#252A24] border-[#D8D7CE] ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
