import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Alert',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-3.5 sm:p-4 rounded-md border border-[#E5C2BF] bg-[#FAF0EF] text-[#252A24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#A9423B] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-[#A9423B] uppercase tracking-wide">{title}</h4>
          <p className="text-xs text-[#5A2420]">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3 h-3" />}
          className="shrink-0 text-xs"
        >
          Retry
        </Button>
      )}
    </div>
  );
};
