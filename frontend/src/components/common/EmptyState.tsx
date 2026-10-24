import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-md border border-dashed border-[#D8D7CE] bg-[#F5F3EC]/50 my-4">
      <div className="p-2.5 bg-[#FFFEFA] border border-[#D8D7CE] rounded text-[#6F726A] mb-2.5 shadow-sm">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <h3 className="text-sm font-bold text-[#252A24]">{title}</h3>
      <p className="mt-1 text-xs text-[#6F726A] max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-3.5">
          <Button size="sm" variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
