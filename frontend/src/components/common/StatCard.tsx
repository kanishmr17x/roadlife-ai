import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'forest' | 'crimson' | 'amber' | 'sage';
  badge?: React.ReactNode;
  technicalCode?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  variant = 'default',
  badge,
  technicalCode,
}) => {
  const borderAccent = {
    default: 'border-[#D8D7CE]',
    forest: 'border-[#D8D7CE] border-t-2 border-t-[#355844]',
    crimson: 'border-[#D8D7CE] border-t-2 border-t-[#A9423B]',
    amber: 'border-[#D8D7CE] border-t-2 border-t-[#C48B32]',
    sage: 'border-[#D8D7CE] border-t-2 border-t-[#78846A]',
  }[variant];

  return (
    <div
      className={`bg-[#FFFEFA] rounded-md border p-3.5 sm:p-4 shadow-sm transition-colors hover:border-[#78846A]/60 flex flex-col justify-between ${borderAccent}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F726A]">
              {title}
            </span>
            {technicalCode && (
              <span className="text-[10px] font-mono text-[#9E9F97] tracking-tighter">
                [{technicalCode}]
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252A24] tabular-nums font-sans">
              {value}
            </span>
            {badge}
          </div>
        </div>
        {icon && (
          <div className="p-2 rounded bg-[#F5F3EC] text-[#355844] border border-[#D8D7CE]/70 shrink-0">
            {icon}
          </div>
        )}
      </div>
      {subtext && (
        <p className="mt-2 text-[11px] text-[#6F726A] border-t border-[#D8D7CE]/50 pt-1.5 flex items-center justify-between">
          <span>{subtext}</span>
        </p>
      )}
    </div>
  );
};
