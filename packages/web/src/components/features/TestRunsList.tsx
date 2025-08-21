import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, TestTube } from 'lucide-react';
import { Table, type TableColumn } from '../ui/Table';
import { StatusBadge, type TestStatus } from '../ui/StatusBadge';
import { Pagination } from '../ui/Pagination';
import { memoize } from '../../utils/performance';
import type { TestRun, PaginatedResponse } from '../../types/api';

export interface TestRunsListProps {
  data?: PaginatedResponse<TestRun> | undefined;
  loading?: boolean;
  error?: Error | string | null | { message: string };
  onPageChange: (page: number) => void;
  onSort?: ((key: string) => void) | undefined;
  sortBy?: string | undefined;
  sortDirection?: 'asc' | 'desc' | undefined;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

// Memoized utility functions for better performance
const formatDuration = memoize((duration: number): string => {
  if (duration < 1000) {
    return `${duration}ms`;
  }

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
});

const formatDate = memoize((dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
});

const getTestCounts = memoize(
  (testRun: TestRun) => {
    const total = testRun.results?.length || 0;
    const passed =
      testRun.results?.filter((r) => r.status === 'passed').length || 0;
    const failed =
      testRun.results?.filter((r) => r.status === 'failed').length || 0;
    const skipped =
      testRun.results?.filter((r) => r.status === 'skipped').length || 0;

    return { total, passed, failed, skipped };
  },
  (testRun) => `${testRun.id}-${testRun.results?.length || 0}`
);

const TestRunsList: React.FC<TestRunsListProps> = ({
  data,
  loading = false,
  error = null,
  onPageChange,
  onSort,
  sortBy,
  sortDirection,
  onRetry,
  retrying = false,
  className = '',
}) => {
  const navigate = useNavigate();

  // Memoize columns definition to prevent unnecessary re-renders
  const columns: TableColumn<TestRun>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        sortable: true,
        width: '120px',
        render: (value) => (
          <span className="font-mono text-xs text-gray-300">
            {String(value).slice(0, 8)}...
          </span>
        ),
      },
      {
        key: 'projectName',
        header: 'Project',
        sortable: true,
        render: (value) => (
          <div className="flex items-center">
            <TestTube className="h-4 w-4 text-gray-400 mr-2" />
            <span className="font-medium text-white">{String(value)}</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        width: '120px',
        render: (value) => (
          <StatusBadge status={value as TestStatus} size="sm" />
        ),
      },
      {
        key: 'duration',
        header: 'Duration',
        sortable: true,
        width: '100px',
        hideOnMobile: true,
        render: (value) => (
          <div className="flex items-center text-gray-300">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">{formatDuration(Number(value))}</span>
          </div>
        ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        sortable: true,
        width: '160px',
        hideOnMobile: true,
        render: (value) => (
          <div className="flex items-center text-gray-300">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">{formatDate(String(value))}</span>
          </div>
        ),
      },
      {
        key: 'results',
        header: 'Tests',
        width: '120px',
        render: (_, row) => {
          const counts = getTestCounts(row);
          return (
            <div className="text-sm">
              <div className="text-white font-medium">{counts.total} total</div>
              <div className="text-xs text-gray-400">
                {counts.passed > 0 && (
                  <span className="text-green-400">{counts.passed} passed</span>
                )}
                {counts.failed > 0 && (
                  <>
                    {counts.passed > 0 && ', '}
                    <span className="text-red-400">{counts.failed} failed</span>
                  </>
                )}
                {counts.skipped > 0 && (
                  <>
                    {(counts.passed > 0 || counts.failed > 0) && ', '}
                    <span className="text-gray-400">
                      {counts.skipped} skipped
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  // Memoize event handlers
  const handleRowClick = useCallback(
    (row: TestRun) => {
      navigate(`/runs/${row.id}`);
    },
    [navigate]
  );

  const getRowClassName = useCallback((row: TestRun) => {
    const baseClass = 'hover:bg-gray-700';

    switch (row.status) {
      case 'failed':
        return `${baseClass} bg-red-900/10 border-l-4 border-l-red-500`;
      case 'passed':
        return `${baseClass} bg-green-900/10 border-l-4 border-l-green-500`;
      case 'skipped':
        return `${baseClass} bg-gray-900/10 border-l-4 border-l-gray-500`;
      default:
        return baseClass;
    }
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white">
            Test Runs
          </h2>
          {data && (
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Showing {data.data.length} of {data.total} test runs
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table<TestRun>
            columns={columns}
            data={data?.data || []}
            loading={loading}
            error={error}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
            onRowClick={handleRowClick}
            rowClassName={getRowClassName}
            emptyTitle="No test runs found"
            emptyDescription="Test runs will appear here once data is available. Try refreshing or check back later."
            {...(onRetry && { onRetry })}
            retrying={retrying}
            className="bg-gray-800"
            skeletonRows={8}
          />
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          onPageChange={onPageChange}
          className="flex justify-center"
        />
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
const MemoizedTestRunsList = React.memo(
  TestRunsList,
  (prevProps, nextProps): boolean => {
    // Custom comparison function for better performance
    return (
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.sortBy === nextProps.sortBy &&
      prevProps.sortDirection === nextProps.sortDirection &&
      prevProps.retrying === nextProps.retrying &&
      prevProps.className === nextProps.className &&
      // Deep comparison for data (only if both exist)
      (prevProps.data === nextProps.data ||
        (!!prevProps.data &&
          !!nextProps.data &&
          prevProps.data.page === nextProps.data.page &&
          prevProps.data.total === nextProps.data.total &&
          prevProps.data.data.length === nextProps.data.data.length &&
          prevProps.data.data.every(
            (item, index) =>
              item.id === nextProps.data!.data[index]?.id &&
              item.status === nextProps.data!.data[index]?.status
          )))
    );
  }
);

MemoizedTestRunsList.displayName = 'TestRunsList';

export { MemoizedTestRunsList as TestRunsList };
