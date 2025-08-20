import { AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { AnalyticsData } from '../../types/api';

interface FlakyTestsTableProps {
  data: AnalyticsData | undefined;
  isLoading: boolean;
  error: Error | null;
  onTestClick?: (testName: string) => void;
}

export function FlakyTestsTable({
  data,
  isLoading,
  error,
  onTestClick,
}: FlakyTestsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
            <AlertTriangle className="h-4 sm:h-5 w-4 sm:w-5" />
            Flaky Tests
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
            <AlertTriangle className="h-4 sm:h-5 w-4 sm:w-5" />
            Flaky Tests
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 sm:p-4">
            <p className="text-red-400 text-sm">
              Failed to load flaky tests data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.flakyTests || data.flakyTests.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
            <AlertTriangle className="h-4 sm:h-5 w-4 sm:w-5" />
            Flaky Tests
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <p className="text-gray-400 text-center py-6 sm:py-8 text-sm">
            No flaky tests found in the selected period
          </p>
        </div>
      </div>
    );
  }

  const getFailureRateColor = (rate: number): string => {
    if (rate >= 50) return 'text-red-400';
    if (rate >= 25) return 'text-orange-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
        <h2 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
          <AlertTriangle className="h-4 sm:h-5 w-4 sm:w-5" />
          Flaky Tests
        </h2>
      </div>
      <div className="p-3 sm:p-6">
        <div className="space-y-1">
          {data.flakyTests.map((test, index) => (
            <div
              key={test.testName}
              className={`flex justify-between items-center py-2 sm:py-3 px-2 sm:px-3 rounded-lg transition-colors touch-manipulation ${
                onTestClick
                  ? 'hover:bg-gray-700/50 cursor-pointer'
                  : 'hover:bg-gray-700/30'
              }`}
              onClick={() => onTestClick?.(test.testName)}
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 ml-5 sm:ml-8">
                  <p className="text-xs text-gray-400">
                    {test.retryCount} retries
                  </p>
                  <p className="text-xs text-gray-400">
                    Last: {format(parseISO(test.lastFailure), 'MMM dd')}
                  </p>
                </div>
              </div>
              <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                <p
                  className={`text-xs sm:text-sm font-medium ${getFailureRateColor(test.failureRate)}`}
                >
                  {test.failureRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">failure</p>
              </div>
            </div>
          ))}
        </div>

        {data.flakyTests.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <AlertTriangle className="h-8 sm:h-12 w-8 sm:w-12 text-gray-600 mx-auto mb-2 sm:mb-3" />
            <p className="text-gray-400 text-sm">
              Great! No flaky tests found in the selected period
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
