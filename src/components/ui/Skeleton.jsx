import React from 'react';

const Skeleton = ({ className = '', variant = 'text', animation = 'pulse' }) => {
  const baseClasses = 'bg-gray-200 rounded';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    rectangle: 'h-24 w-full',
    circle: 'h-12 w-12 rounded-full',
    card: 'h-64 w-full rounded-2xl',
    button: 'h-10 w-24 rounded-xl',
  };

  return (
    <div
      className={`${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => (
  <div className={`card ${className}`} role="status" aria-label="Loading card">
    <div className="card-body space-y-3">
      <Skeleton variant="rectangle" className="h-48 mb-4" />
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-4/5" />
      <div className="flex justify-between items-center mt-4">
        <Skeleton variant="text" className="w-20" />
        <div className="flex gap-2">
          <Skeleton variant="button" />
          <Skeleton variant="button" className="w-16" />
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;
