import type { AnalyticsData } from '../../types/api';

interface StatsOverviewProps {
  data: AnalyticsData | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function StatsOverview({ data, isLoading, error }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-600 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-full bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-full bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-center">
            No analytics data available
          </p>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Test Runs */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400">Total Test Runs</h3>
        <p className="text-3xl font-bold text-white mt-2">
          {data.totalRuns.toLocaleString()}
        </p>
        <p className="text-sm text-gray-400 mt-1">in selected period</p>
      </div>

      {/* Average Success Rate */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400">
          Average Success Rate
        </h3>
        <p
          className={`text-3xl font-bold mt-2 ${
            data.successRate >= 90
              ? 'text-green-400'
              : data.successRate >= 70
                ? 'text-yellow-400'
                : 'text-red-400'
          }`}
        >
          {data.successRate.toFixed(1)}%
        </p>
        <p className="text-sm text-gray-400 mt-1">across all projects</p>
      </div>

      {/* Average Duration */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400">Average Duration</h3>
        <p className="text-3xl font-bold text-white mt-2">
          {formatDuration(data.averageDuration)}
        </p>
        <p className="text-sm text-gray-400 mt-1">per test run</p>
      </div>
    </div>
  );
}
