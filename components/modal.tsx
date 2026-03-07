'use client';

import { useEffect, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card max-w-md w-full mx-4 p-6 animate-fade-in-up">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {description && (
              <p className="text-gray-400">{description}</p>
            )}
          </div>

          {/* Children (for forms) */}
          {children && <div>{children}</div>}

          {/* Footer */}
          {(footer || onConfirm) && (
            <div className="flex gap-3 pt-4">
              {footer ? (
                footer
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 btn-secondary border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    {cancelText}
                  </button>
                  {onConfirm && (
                    <button
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                      className={`flex-1 btn-primary ${
                        isDestructive ? 'bg-red-600 hover:bg-red-700' : ''
                      }`}
                    >
                      {confirmText}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
