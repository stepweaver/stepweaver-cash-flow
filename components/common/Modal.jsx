'use client';

import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case '2xl':
        return 'max-w-2xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-md';
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div
        className={`bg-terminal-light rounded-lg ${getSizeClasses()} w-full mx-4 border border-terminal-border`}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-terminal-border'>
          <h3 className='text-lg font-semibold text-terminal-green font-ibm-custom'>
            {title}
          </h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className='text-terminal-muted hover:text-terminal-text transition-colors'
            >
              <X className='h-5 w-5 lucide' />
            </button>
          )}
        </div>

        {/* Content */}
        <div className='p-6'>{children}</div>
      </div>
    </div>
  );
}
