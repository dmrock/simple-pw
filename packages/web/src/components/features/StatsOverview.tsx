import { StatCardSkeleton, ErrorEmptyState, NoDataEmptyState } from '../ui';
import type { AnalyticsData } from '../../types/api';

interface StatsOverviewProps {
  data: AnalyticsData | undefined;
  isLoading: boolean;
  error: Error | string | null | { message: string };
  onRetry?: () => void;
  retrying?: boolean;
}

export function StatsOverview({
  data,
  isLoading,
  error,
  onRetry,
  retrying = false,
}: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-full">
          <ErrorEmptyState
            title="Failed to load analytics"
            description={
              typeof error === 'string'
                ? error
                : error instanceof Error
                  ? error.message
                  : error?.message || 'An unknown error occurred'
            }
            onRetry={onRetry}
            retrying={retrying}
            className="py-8"
          />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-full">
          <NoDataEmptyState
            title="No analytics data"
            description="Analytics data will appear here once test runs are available."
            onRefresh={onRetry}
            refreshing={retrying}
            className="py-8"
          />
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Total Test Runs */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-gray-400">
          Total Test Runs
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">
          {data.totalRuns.toLocaleString()}
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          in selected period
        </p>
      </div>

      {/* Average Success Rate */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-gray-400">
          Success Rate
        </h3>
        <p
          className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${
            data.successRate >= 90
              ? 'text-green-400'
              : data.successRate >= 70
                ? 'text-yellow-400'
                : 'text-red-400'
          }`}
        >
          {data.successRate.toFixed(1)}%
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          across all projects
        </p>
      </div>

      {/* Average Duration */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-700 sm:col-span-2 lg:col-span-1">
        <h3 className="text-xs sm:text-sm font-medium text-gray-400">
          Average Duration
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">
          {formatDuration(data.averageDuration)}
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">per test run</p>
      </div>
    </div>
  );
}
