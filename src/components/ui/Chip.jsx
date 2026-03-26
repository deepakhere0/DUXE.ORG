import React from 'react';

const variants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-accent-100 text-accent-700',
  navy: 'bg-navy-100 text-navy-700',
};

const Chip = ({ children, variant = 'default', onClose, className = '' }) => {
  return (
    <span className={`chip ${variants[variant]} ${className}`}>
      {children}
      {onClose && (
        <button className="ml-2 text-xs" onClick={onClose} aria-label="Remove">
          ×
        </button>
      )}
    </span>
  );
};

export default Chip;

