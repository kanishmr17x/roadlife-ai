import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'terracotta';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed select-none border';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#0F172A] hover:bg-[#1E293B] text-white border-[#0F172A] shadow-sm',
    secondary:
      'bg-white hover:bg-[#F8F9FA] text-[#0F172A] border-[#E5E7EB] hover:border-[#D1D5DB] shadow-sm',
    danger:
      'bg-[#DC2626] hover:bg-[#B91C1C] text-white border-[#DC2626] shadow-sm',
    terracotta:
      'bg-[#EA580C] hover:bg-[#C2410C] text-white border-[#EA580C] shadow-sm',
    outline:
      'bg-transparent hover:bg-[#F1F5F9] text-[#0F172A] border-[#D1D5DB]',
    ghost:
      'bg-transparent hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] border-transparent',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
