import React from 'react';
import {
  LucideIcon,
  Search,
  Database,
  AlertCircle,
  Wifi,
  RefreshCw,
} from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'outline';
    loading?: boolean;
  };
  className?: string;
  variant?: 'default' | 'search' | 'error' | 'offline';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  variant = 'default',
}) => {
  // Default icons based on variant
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return Search;
      case 'error':
        return AlertCircle;
      case 'offline':
        return Wifi;
      default:
        return Database;
    }
  };

  const DisplayIcon = Icon || getDefaultIcon();

  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return 'text-red-400';
      case 'offline':
        return 'text-orange-400';
      case 'search':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div
        className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-800 mb-6`}
      >
        <DisplayIcon className={`h-8 w-8 ${getIconColor()}`} />
      </div>

      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>

      <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          loading={!!action.loading}
          {...(action.loading && { icon: RefreshCw })}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Predefined empty state components for common scenarios
export const NoDataEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  className?: string;
}> = ({
  title = 'No data available',
  description = 'There is no data to display at the moment. Try refreshing or check back later.',
  onRefresh,
  refreshing = false,
  className = '',
}) => (
  <EmptyState
    variant="default"
    title={title}
    description={description}
    {...(onRefresh && {
      action: {
        label: refreshing ? 'Refreshing...' : 'Refresh',
        onClick: onRefresh,
        loading: refreshing,
      },
    })}
    className={className}
  />
);

export const SearchEmptyState: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}> = ({ searchTerm, onClearSearch, className = '' }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={
      searchTerm
        ? `No results found for "${searchTerm}". Try adjusting your search terms or filters.`
        : 'No results found. Try adjusting your search terms or filters.'
    }
    {...(onClearSearch && {
      action: {
        label: 'Clear search',
        onClick: onClearSearch,
        variant: 'outline' as const,
      },
    })}
    className={className}
  />
);

export const ErrorEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}> = ({
  title = 'Something went wrong',
  description = 'We encountered an error while loading the data. Please try again.',
  onRetry,
  retrying = false,
  className = '',
}) => (
  <EmptyState
    variant="error"
    title={title}
    description={description}
    {...(onRetry && {
      action: {
        label: retrying ? 'Retrying...' : 'Try again',
        onClick: onRetry,
        loading: retrying,
      },
    })}
    className={className}
  />
);

export const OfflineEmptyState: React.FC<{
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}> = ({ onRetry, retrying = false, className = '' }) => (
  <EmptyState
    variant="offline"
    title="You're offline"
    description="Please check your internet connection and try again."
    {...(onRetry && {
      action: {
        label: retrying ? 'Connecting...' : 'Try again',
        onClick: onRetry,
        loading: retrying,
      },
    })}
    className={className}
  />
);

export { EmptyState };
