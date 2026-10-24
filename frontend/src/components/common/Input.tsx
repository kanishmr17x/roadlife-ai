import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#252A24] mb-1">
            {label}
            {props.required && <span className="text-[#A9423B] ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F726A]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded bg-[#FFFEFA] border text-[#252A24] placeholder-[#9E9F97] text-xs sm:text-sm py-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#355844]/25 ${
              leftIcon ? 'pl-9' : 'pl-3'
            } ${rightIcon ? 'pr-9' : 'pr-3'} ${
              error
                ? 'border-[#A9423B] focus:border-[#A9423B]'
                : 'border-[#D8D7CE] focus:border-[#355844] hover:border-[#BDBCAF]'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6F726A]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-[#A9423B] flex items-center gap-1 font-medium">
            <span>⚠</span> {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-[11px] text-[#6F726A]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
