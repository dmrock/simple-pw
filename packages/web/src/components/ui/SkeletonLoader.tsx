import React from 'react';

export interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'table' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
  animate = true,
}) => {
  const baseClasses = ['bg-gray-700', animate ? 'animate-pulse' : '', className]
    .filter(Boolean)
    .join(' ');

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'rectangular':
        return 'rounded-md';
      case 'circular':
        return 'rounded-full';
      case 'table':
        return 'h-12 rounded-md';
      case 'card':
        return 'h-32 rounded-lg';
      default:
        return 'h-4 rounded';
    }
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height)
    style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width || '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${getVariantClasses()}`} style={style} />
  );
};

// Predefined skeleton components for common use cases
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLoader key={colIndex} variant="table" className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{
  className?: string;
  showHeader?: boolean;
  showContent?: boolean;
}> = ({ className = '', showHeader = true, showContent = true }) => (
  <div
    className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
  >
    {showHeader && (
      <div className="mb-4">
        <SkeletonLoader variant="text" width="40%" height="20px" />
      </div>
    )}
    {showContent && (
      <div className="space-y-3">
        <SkeletonLoader variant="text" lines={3} />
        <SkeletonLoader variant="rectangular" height="120px" />
      </div>
    )}
  </div>
);

export const StatCardSkeleton: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div
    className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}
  >
    <SkeletonLoader variant="text" width="60%" height="16px" className="mb-3" />
    <SkeletonLoader variant="text" width="40%" height="32px" />
  </div>
);

export const ListSkeleton: React.FC<{
  items?: number;
  className?: string;
}> = ({ items = 5, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div
        key={index}
        className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
      >
        <SkeletonLoader variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="30%" />
          <SkeletonLoader variant="text" width="60%" />
        </div>
        <SkeletonLoader variant="text" width="80px" />
      </div>
    ))}
  </div>
);

export { SkeletonLoader };
