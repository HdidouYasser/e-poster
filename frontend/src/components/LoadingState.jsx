import React from 'react';

/**
 * Skeleton loader pour différents types de contenu
 */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 rounded-lg animate-pulse"
        style={{
          width: i === lines - 1 ? '80%' : '100%'
        }}
      />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, row) => (
      <div key={row} className="flex gap-3">
        {Array.from({ length: cols }).map((_, col) => (
          <div
            key={col}
            className="h-12 bg-gray-200 rounded-lg flex-1 animate-pulse"
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 40 }) => (
  <div
    className="bg-gray-200 rounded-full animate-pulse"
    style={{ width: size, height: size }}
  />
);

export const SkeletonImage = ({ width = 300, height = 400 }) => (
  <div
    className="bg-gray-200 rounded-lg animate-pulse"
    style={{ width, height }}
  />
);

/**
 * Composant LoadingState pour afficher les skeletons
 */
export const LoadingState = ({ type = 'card', count = 1 }) => {
  switch (type) {
    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="space-y-3 p-4">
              <SkeletonCard className="h-48" />
              <SkeletonText lines={3} />
            </div>
          ))}
        </div>
      );

    case 'table':
      return <SkeletonTable rows={count} />;

    case 'list':
      return (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <SkeletonAvatar size={40} />
              <SkeletonText lines={2} className="flex-1" />
            </div>
          ))}
        </div>
      );

    case 'detail':
      return (
        <div className="space-y-4">
          <SkeletonImage />
          <SkeletonText lines={5} />
        </div>
      );

    default:
      return <SkeletonCard className="h-20" />;
  }
};

export default LoadingState;
