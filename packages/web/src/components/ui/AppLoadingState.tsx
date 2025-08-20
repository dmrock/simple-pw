import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export interface AppLoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
}

export const AppLoadingState: React.FC<AppLoadingStateProps> = ({
  message = 'Loading...',
  size = 'lg',
  className = '',
  fullScreen = false,
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-gray-900 flex items-center justify-center z-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
};

// Specialized loading states for different scenarios
export const PageLoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading page...',
}) => <AppLoadingState message={message} size="lg" className="min-h-[400px]" />;

export const ComponentLoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => <AppLoadingState message={message} size="md" className="py-8" />;

export const FullScreenLoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading application...',
}) => <AppLoadingState message={message} size="xl" fullScreen />;
