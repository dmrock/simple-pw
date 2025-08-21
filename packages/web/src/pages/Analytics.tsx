import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useRenderPerformance } from '../utils/performance';
import { useAnalytics, useRealTimeData, useApiErrorHandler } from '../hooks';
import { StatsOverview } from '../components/features/StatsOverview';
import { SuccessRateChart } from '../components/features/SuccessRateChart';
import { SlowestTestsTable } from '../components/features/SlowestTestsTable';
import { FlakyTestsTable } from '../components/features/FlakyTestsTable';
import {
  DateRangePicker,
  getDefaultDateRange,
} from '../components/features/DateRangePicker';
import {
  Button,
  ConnectionStatus,
  RealTimeIndicator,
  ErrorBoundary,
  RetryButton,
} from '../components/ui';
import type { DateRange } from '../types/api';

export function Analytics() {
  // Performance monitoring
  useRenderPerformance('Analytics');

  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useAnalytics(dateRange, {
    enablePolling: true,
    pollingInterval: 60000, // 1 minute for analytics
  });

  const errorHandler = useApiErrorHandler();

  const { connectionStatus, refreshData, lastUpdate } = useRealTimeData(
    'analytics',
    {
      dateRange,
      enablePolling: true,
      pollingInterval: 60000,
    }
  );

  // Memoize expensive navigation callback
  const handleTestClick = useCallback(
    (testName: string) => {
      // Navigate to test history page (future implementation)
      navigate(`/tests/${encodeURIComponent(testName)}`);
    },
    [navigate]
  );

  const handleRefresh = useCallback(async () => {
    try {
      errorHandler.clearError();
      await Promise.all([refreshData(), refetch()]);
    } catch (err) {
      errorHandler.handleError(err as Error);
    }
  }, [refreshData, refetch, errorHandler]);

  const handleRetry = useCallback(async () => {
    await errorHandler.retry(async () => {
      await refetch();
    });
  }, [errorHandler, refetch]);

  return (
    <ErrorBoundary level="page">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Analytics
            </h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="hidden sm:block">
                <RealTimeIndicator
                  isPolling={connectionStatus.isConnected}
                  lastUpdate={lastUpdate}
                  onRefresh={handleRefresh}
                  isRefreshing={isLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <ConnectionStatus
          isOnline={connectionStatus.isOnline}
          isConnected={connectionStatus.isConnected}
          lastConnected={connectionStatus.lastConnected}
          retryCount={connectionStatus.retryCount}
          onRetry={connectionStatus.retryConnection}
        />

        {/* Global Error State */}
        {(error || errorHandler.error) && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-red-400 font-medium">
                  Error loading analytics data
                </h3>
                <p className="text-red-300 text-sm mt-1">
                  {errorHandler.getErrorMessage(error || errorHandler.error)}
                </p>
              </div>
              <RetryButton
                onRetry={handleRetry}
                error={error || errorHandler.error}
                maxRetries={3}
                variant="outline"
                size="sm"
                className="ml-4"
              />
            </div>
          </div>
        )}

        {/* Analytics Components with Error Boundaries */}
        <ErrorBoundary
          level="component"
          onError={(error) => errorHandler.handleError(error)}
        >
          <StatsOverview
            data={analyticsData}
            isLoading={isLoading}
            error={error || errorHandler.error}
          />
        </ErrorBoundary>

        <ErrorBoundary
          level="component"
          onError={(error) => errorHandler.handleError(error)}
        >
          <SuccessRateChart
            data={analyticsData}
            isLoading={isLoading}
            error={error || errorHandler.error}
          />
        </ErrorBoundary>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <ErrorBoundary
            level="component"
            onError={(error) => errorHandler.handleError(error)}
          >
            <SlowestTestsTable
              data={analyticsData}
              isLoading={isLoading}
              error={error || errorHandler.error}
            />
          </ErrorBoundary>

          <ErrorBoundary
            level="component"
            onError={(error) => errorHandler.handleError(error)}
          >
            <FlakyTestsTable
              data={analyticsData}
              isLoading={isLoading}
              error={error || errorHandler.error}
              onTestClick={handleTestClick}
            />
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}
