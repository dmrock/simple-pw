import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { ErrorEmptyState, NoDataEmptyState } from './EmptyState';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  hideOnMobile?: boolean;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  sortBy?: string | undefined;
  sortDirection?: 'asc' | 'desc' | undefined;
  onSort?: ((key: string) => void) | undefined;
  loading?: boolean;
  error?: Error | string | null | { message: string };
  emptyMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  rowClassName?: ((row: T, index: number) => string) | undefined;
  onRowClick?: ((row: T, index: number) => void) | undefined;
  onRetry?: () => void;
  retrying?: boolean;
  showEmptyState?: boolean;
  skeletonRows?: number;
}

const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  sortBy,
  sortDirection,
  onSort,
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  emptyTitle = 'No data found',
  emptyDescription = 'There is no data to display at the moment.',
  className = '',
  rowClassName,
  onRowClick,
  onRetry,
  retrying = false,
  showEmptyState = true,
  skeletonRows = 5,
}: TableProps<T>) => {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-gray-200" />
    ) : (
      <ChevronDown className="h-4 w-4 text-gray-200" />
    );
  };

  const renderCellValue = (column: TableColumn<T>, row: T): React.ReactNode => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    return value as React.ReactNode;
  };

  const getRowClasses = (row: T, index: number) => {
    const baseClasses = 'hover:bg-gray-700 transition-colors';
    const clickableClasses = onRowClick ? 'cursor-pointer' : '';
    const customClasses = rowClassName ? rowClassName(row, index) : '';

    return [baseClasses, clickableClasses, customClasses]
      .filter(Boolean)
      .join(' ');
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <div
        className={`overflow-hidden shadow ring-1 ring-gray-700 rounded-lg ${className}`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${
                      column.hideOnMobile ? 'hidden sm:table-cell' : ''
                    } ${column.headerClassName || ''}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    <span className="truncate">{column.header}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {Array.from({ length: skeletonRows }).map((_, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-3 sm:px-6 py-4 ${
                        column.hideOnMobile ? 'hidden sm:table-cell' : ''
                      }`}
                    >
                      <div className="h-4 bg-gray-600 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Error state
  if (error && showEmptyState) {
    return (
      <div
        className={`overflow-hidden shadow ring-1 ring-gray-700 rounded-lg ${className}`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${
                      column.hideOnMobile ? 'hidden sm:table-cell' : ''
                    } ${column.headerClassName || ''}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    <span className="truncate">{column.header}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800">
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <ErrorEmptyState
                    title="Failed to load data"
                    description={
                      typeof error === 'string'
                        ? error
                        : error instanceof Error
                          ? error.message
                          : error?.message || 'An unknown error occurred'
                    }
                    {...(onRetry && { onRetry })}
                    retrying={retrying}
                    className="py-8"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Normal table rendering
  return (
    <div
      className={`overflow-hidden shadow ring-1 ring-gray-700 rounded-lg ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${
                    column.hideOnMobile ? 'hidden sm:table-cell' : ''
                  } ${column.headerClassName || ''}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.sortable ? (
                    <button
                      className="group inline-flex items-center space-x-1 hover:text-gray-100 touch-manipulation"
                      onClick={() => handleSort(column.key)}
                    >
                      <span className="truncate">{column.header}</span>
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    <span className="truncate">{column.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {showEmptyState ? (
                    <NoDataEmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      {...(onRetry && { onRefresh: onRetry })}
                      refreshing={retrying}
                      className="py-8"
                    />
                  ) : (
                    <div className="px-3 sm:px-6 py-8 sm:py-12 text-center text-sm text-gray-400">
                      {emptyMessage}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className={getRowClasses(row, index)}
                  onClick={
                    onRowClick ? () => onRowClick(row, index) : undefined
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-300 ${
                        column.hideOnMobile ? 'hidden sm:table-cell' : ''
                      } ${column.className || ''}`}
                    >
                      <div className="truncate max-w-[120px] sm:max-w-none">
                        {renderCellValue(column, row)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Table };
