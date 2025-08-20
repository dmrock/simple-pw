import { Clock } from 'lucide-react';
import type { AnalyticsData } from '../../types/api';

interface SlowestTestsTableProps {
  data: AnalyticsData | undefined;
  isLoading: boolean;
  error: Error | null | { message: string };
}

export function SlowestTestsTable({
  data,
  isLoading,
  error,
}: SlowestTestsTableProps) {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
            <Clock className="h-4 sm:h-5 w-4 sm:w-5" />
            Slowest Tests
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center py-2">
                  <div className="h-3 sm:h-4 bg-gray-600 rounded w-32 sm:w-48"></div>
                  <div className="h-3 sm:h-4 bg-gray-600 rounded w-12 sm:w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
            <Clock className="h-4 sm:h-5 w-4 sm:w-5" />
            Slowest Tests
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 sm:p-4">
            <p className="text-red-400 text-sm">
              Failed to load slowest tests data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.slowestTests || data.slowestTests.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
            <Clock className="h-4 sm:h-5 w-4 sm:w-5" />
            Slowest Tests
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <p className="text-gray-400 text-center py-6 sm:py-8 text-sm">
            No slowest tests data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
        <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
          <Clock className="h-4 sm:h-5 w-4 sm:w-5" />
          Slowest Tests
        </h2>
      </div>
      <div className="p-3 sm:p-6">
        <div className="space-y-1">
          {data.slowestTests.map((test, index) => (
            <div
              key={test.testName}
              className="flex justify-between items-center py-2 sm:py-3 px-2 sm:px-3 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs font-medium text-gray-400 w-4 sm:w-6 flex-shrink-0">
                    #{index + 1}
                  </span>
                  <p
                    className="text-xs sm:text-sm font-medium text-white truncate"
                    title={test.testName}
                  >
                    {test.testName}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-5 sm:ml-8">
                  {test.runCount} run{test.runCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                <p className="text-xs sm:text-sm font-medium text-orange-400">
                  {formatDuration(test.averageDuration)}
                </p>
                <p className="text-xs text-gray-400">avg</p>
              </div>
            </div>
          ))}
        </div>

        {data.slowestTests.length === 0 && (
          <p className="text-gray-400 text-center py-6 sm:py-8 text-sm">
            No slow tests found in the selected period
          </p>
        )}
      </div>
    </div>
  );
}
