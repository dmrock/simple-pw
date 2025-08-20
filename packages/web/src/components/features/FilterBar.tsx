import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import { SearchInput } from '../ui/SearchInput';
import type { TestRunFilters, TestRun } from '../../types/api';

export interface FilterBarProps {
  filters: TestRunFilters;
  onFiltersChange: (filters: TestRunFilters) => void;
  onReset?: () => void;
  projectOptions?: string[];
  loading?: boolean;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  onReset,
  projectOptions = [],
  loading = false,
  className = '',
}) => {
  const updateFilter = (
    key: keyof TestRunFilters,
    value: string | undefined
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.projectName ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo
  );

  const handleReset = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
    });
    onReset?.();
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 border border-gray-700 ${className}`}
    >
      <div className="flex flex-col space-y-3 sm:space-y-4">
        {/* Search and Reset Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <SearchInput
              value={filters.search || ''}
              onChange={(value) => updateFilter('search', value)}
              placeholder="Search by project name or ID..."
              disabled={loading}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="inline-flex items-center justify-center px-3 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Reset Filters</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Project Filter */}
          <div className="sm:col-span-1">
            <label
              htmlFor="project-filter"
              className="block text-xs font-medium text-gray-400 mb-1 sm:sr-only"
            >
              Project
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="project-filter"
                value={filters.projectName || ''}
                onChange={(e) => updateFilter('projectName', e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <option value="">All Projects</option>
                {projectOptions.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-1">
            <label
              htmlFor="status-filter"
              className="block text-xs font-medium text-gray-400 mb-1 sm:sr-only"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) =>
                updateFilter('status', e.target.value as TestRun['status'])
              }
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <option value="">All Statuses</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>

          {/* Date From Filter */}
          <div className="sm:col-span-1">
            <label
              htmlFor="date-from-filter"
              className="block text-xs font-medium text-gray-400 mb-1 sm:sr-only"
            >
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="date-from-filter"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                placeholder="From date"
              />
            </div>
          </div>

          {/* Date To Filter */}
          <div className="sm:col-span-1">
            <label
              htmlFor="date-to-filter"
              className="block text-xs font-medium text-gray-400 mb-1 sm:sr-only"
            >
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="date-to-filter"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                placeholder="To date"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { FilterBar };
