import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  hideOnMobile?: boolean;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  sortBy,
  sortDirection,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  rowClassName,
  onRowClick,
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
      <ChevronUp className="h-4 w-4 text-gray-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-gray-600" />
    );
  };

  const renderCellValue = (column: TableColumn<T>, row: T) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    return value;
  };

  const getRowClasses = (row: T, index: number) => {
    const baseClasses = 'hover:bg-gray-50 transition-colors';
    const clickableClasses = onRowClick ? 'cursor-pointer' : '';
    const customClasses = rowClassName ? rowClassName(row, index) : '';

    return [baseClasses, clickableClasses, customClasses]
      .filter(Boolean)
      .join(' ');
  };

  if (loading) {
    return (
      <div
        className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${className}`}
      >
        <div className="min-w-full divide-y divide-gray-300">
          <div className="bg-gray-50 px-6 py-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white px-6 py-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.hideOnMobile ? 'hidden sm:table-cell' : ''
                  } ${column.headerClassName || ''}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.sortable ? (
                    <button
                      className="group inline-flex items-center space-x-1 hover:text-gray-700"
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.header}</span>
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
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
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.hideOnMobile ? 'hidden sm:table-cell' : ''
                      } ${column.className || ''}`}
                    >
                      {renderCellValue(column, row)}
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
