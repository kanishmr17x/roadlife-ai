import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flat' | 'interactive' | 'accent' | 'stone';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  noPadding = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-md transition-colors duration-150';

  const variantClasses = {
    default: 'bg-[#FFFEFA] border border-[#D8D7CE] shadow-sm',
    flat: 'bg-[#F5F3EC] border border-[#D8D7CE]/80',
    interactive:
      'bg-[#FFFEFA] border border-[#D8D7CE] hover:border-[#78846A] shadow-sm cursor-pointer',
    accent: 'bg-[#FFFEFA] border border-[#D8D7CE] border-l-4 border-l-[#355844] shadow-sm',
    stone: 'bg-[#EAE8DF]/60 border border-[#D8D7CE]',
  }[variant];

  const paddingClass = noPadding ? '' : 'p-4 sm:p-5';

  return (
    <div className={`${baseClasses} ${variantClasses} ${paddingClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
