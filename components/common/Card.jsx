'use client';

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'p-6',
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'light':
        return 'bg-terminal-light border-terminal-border';
      case 'dark':
        return 'bg-terminal-dark border-terminal-border';
      case 'success':
        return 'bg-terminal-dark border-terminal-green';
      case 'danger':
        return 'bg-terminal-dark border-terminal-red';
      case 'warning':
        return 'bg-terminal-dark border-terminal-yellow';
      case 'info':
        return 'bg-terminal-dark border-terminal-blue';
      default:
        return 'bg-terminal-light border-terminal-border';
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div
      className={`${variantClasses} rounded-lg shadow-sm border ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
