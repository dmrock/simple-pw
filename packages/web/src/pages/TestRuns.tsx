import { useState, useEffect, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTestRuns } from '../hooks/useApi';
import { FilterBar } from '../components/features/FilterBar';
import { TestRunsList } from '../components/features/TestRunsList';
import { Button, LoadingSpinner } from '../components/ui';
import type { TestRunFilters } from '../types/api';

export function TestRuns() {
  const [filters, setFilters] = useState<TestRunFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, error, refetch } = useTestRuns(filters);

  // Extract unique project names for filter options
  const projectOptions = useMemo(() => {
    if (!data?.data) return [];

    const projects = new Set(data.data.map((run) => run.projectName));
    return Array.from(projects).sort();
  }, [data?.data]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: TestRunFilters) => {
    setFilters({
      ...newFilters,
      page: newFilters.page || 1, // Reset to page 1 when filters change
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle sorting
  const handleSort = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: key as 'createdAt' | 'duration' | 'projectName' | 'status',
      sortOrder:
        prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1, // Reset to page 1 when sorting changes
    }));
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      refetch();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [refetch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Test Runs</h1>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        projectOptions={projectOptions}
        loading={isLoading}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-400 font-medium">
                Error loading test runs
              </h3>
              <p className="text-red-300 text-sm mt-1">
                {error.message || 'An unexpected error occurred'}
              </p>
            </div>
            <Button onClick={handleRefresh} variant="secondary" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading State (initial load) */}
      {isLoading && !data && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Test Runs List */}
      {(data || (!isLoading && !error)) && (
        <TestRunsList
          data={data || undefined}
          loading={isLoading}
          onPageChange={handlePageChange}
          onSort={handleSort}
          sortBy={filters.sortBy}
          sortDirection={filters.sortOrder}
        />
      )}
    </div>
  );
}
