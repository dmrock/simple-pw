import { useState, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTestRuns, useRealTimeData, useApiErrorHandler } from '../hooks';
import { FilterBar } from '../components/features/FilterBar';
import { TestRunsList } from '../components/features/TestRunsList';
import {
  Button,
  ConnectionStatus,
  RealTimeIndicator,
  ErrorBoundary,
  RetryButton,
} from '../components/ui';
import type { TestRunFilters } from '../types/api';

export function TestRuns() {
  const [filters, setFilters] = useState<TestRunFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, error, refetch } = useTestRuns(filters, {
    enablePolling: true,
    pollingInterval: 30000,
  });

  const errorHandler = useApiErrorHandler();

  const { connectionStatus, refreshData, lastUpdate } = useRealTimeData(
    'testRuns',
    {
      filters,
      enablePolling: true,
      pollingInterval: 30000,
    }
  );

  // Extract unique project names for filter options
  const projectOptions = useMemo(() => {
    if (!data?.data) return [];

    const projects = new Set(data.data.map((run) => run.projectName));
    return Array.from(projects).sort();
  }, [data?.data]);

  // Memoize filter change handler
  const handleFiltersChange = useCallback((newFilters: TestRunFilters) => {
    setFilters({
      ...newFilters,
      page: newFilters.page || 1, // Reset to page 1 when filters change
    });
  }, []);

  // Memoize pagination handler
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // Memoize sorting handler
  const handleSort = useCallback((key: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: key as 'createdAt' | 'duration' | 'projectName' | 'status',
      sortOrder:
        prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1, // Reset to page 1 when sorting changes
    }));
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    try {
      errorHandler.clearError();
      await Promise.all([refreshData(), refetch()]);
    } catch (err) {
      errorHandler.handleError(err as Error);
    }
  }, [refreshData, refetch, errorHandler]);

  // Handle retry for failed requests
  const handleRetry = useCallback(async () => {
    await errorHandler.retry(async () => {
      await refetch();
    });
  }, [errorHandler, refetch]);

  // Memoize reset filters handler
  const handleResetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }, []);

  return (
    <ErrorBoundary level="page">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Test Runs
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <RealTimeIndicator
                isPolling={connectionStatus.isConnected}
                lastUpdate={lastUpdate}
                onRefresh={handleRefresh}
                isRefreshing={isLoading}
              />
            </div>
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

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
          projectOptions={projectOptions}
          loading={isLoading}
        />

        {/* Error State */}
        {(error || errorHandler.error) && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-red-400 font-medium">
                  Error loading test runs
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

        {/* Test Runs List with Error Boundary */}
        <ErrorBoundary
          level="component"
          onError={(error) => errorHandler.handleError(error)}
        >
          <TestRunsList
            data={data || undefined}
            loading={isLoading}
            error={error || errorHandler.error}
            onPageChange={handlePageChange}
            onSort={handleSort}
            sortBy={filters.sortBy}
            sortDirection={filters.sortOrder}
            onRetry={handleRetry}
            retrying={errorHandler.isRetrying}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}
