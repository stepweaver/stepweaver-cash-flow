'use client';

import { formatCurrency } from '@/lib/utils';

export default function SummaryCard({
  icon: Icon,
  title,
  value,
  subtitle,
  variant = 'default',
  className = '',
  children,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-terminal-green text-terminal-green';
      case 'danger':
        return 'border-terminal-red text-terminal-red';
      case 'warning':
        return 'border-terminal-yellow text-terminal-yellow';
      case 'info':
        return 'border-terminal-blue text-terminal-blue';
      case 'purple':
        return 'border-terminal-purple text-terminal-purple';
      default:
        return 'border-terminal-border text-terminal-muted';
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div
      className={`bg-terminal-dark p-6 rounded-lg shadow-sm border border-terminal-border ${className}`}
    >
      <div className='flex items-center'>
        <div
          className={`p-2 bg-terminal-dark rounded-lg border bg-opacity-40 ${variantStyles}`}
        >
          <Icon className={`h-6 w-6 lucide`} />
        </div>
        <div className='ml-4'>
          <p className='text-sm font-medium text-terminal-muted font-ibm'>
            {title}
          </p>
          <p
            className={`text-2xl font-bold font-ibm-custom ${
              variantStyles.includes('text-terminal-')
                ? variantStyles
                    .split(' ')
                    .find((c) => c.startsWith('text-terminal-'))
                : 'text-terminal-text'
            }`}
          >
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {subtitle && (
            <p className='text-xs text-terminal-muted font-ibm'>{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
