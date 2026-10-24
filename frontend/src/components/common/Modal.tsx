import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#252A24]/40 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />

        {/* Modal content */}
        <div
          className={`relative transform overflow-hidden rounded-md bg-[#FFFEFA] border border-[#D8D7CE] text-left shadow-xl transition-all sm:my-8 w-full ${maxWidthClass}`}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-[#D8D7CE] bg-[#F5F3EC]/50 px-5 py-3.5">
              <h3 className="text-sm font-bold tracking-tight text-[#252A24]">{title}</h3>
              <button
                onClick={onClose}
                className="rounded p-1 text-[#6F726A] hover:bg-[#E5EADF] hover:text-[#252A24] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
};
