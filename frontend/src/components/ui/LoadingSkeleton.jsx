import React from 'react';

/**
 * Professional Loading Skeleton Component
 * Smooth loading states instead of spinners
 */
export const LoadingSkeleton = ({ variant = 'card', count = 1 }) => {
  const skeletons = {
    card: (
      <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
          <div className="w-16 h-6 bg-neutral-200 rounded-full" />
        </div>
        <div className="h-8 bg-neutral-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
      </div>
    ),
    
    list: (
      <div className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-neutral-200 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
          </div>
          <div className="h-6 bg-neutral-200 rounded w-20" />
        </div>
      </div>
    ),
    
    hero: (
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4" />
        <div className="h-12 bg-neutral-200 rounded w-1/2 mb-6" />
        <div className="flex gap-3">
          <div className="h-10 bg-neutral-200 rounded-lg w-32" />
          <div className="h-10 bg-neutral-200 rounded-lg w-32" />
        </div>
      </div>
    ),
    
    text: (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-full" />
        <div className="h-4 bg-neutral-200 rounded w-5/6" />
        <div className="h-4 bg-neutral-200 rounded w-4/6" />
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{skeletons[variant]}</div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
