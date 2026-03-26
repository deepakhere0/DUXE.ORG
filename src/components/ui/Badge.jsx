import React from 'react';

const variants = {
  brand: 'bg-accent-100 text-accent-700 border-accent-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

const Badge = ({ children, variant = 'brand', size = 'md', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
