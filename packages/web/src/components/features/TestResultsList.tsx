import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { TestResultItem } from './TestResultItem';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import type { TestResult } from '../../types/api';

export interface TestResultsListProps {
  testResults: TestResult[];
  onViewMedia?: (type: 'screenshot' | 'video', url: string) => void;
}

type SortField = 'testName' | 'duration' | 'status' | 'fileName';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'passed' | 'failed' | 'skipped' | 'timedOut';

export function TestResultsList({
  testResults,
  onViewMedia,
}: TestResultsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('testName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = testResults;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (result) =>
          result.testName.toLowerCase().includes(query) ||
          result.fileName.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((result) => result.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'testName':
          aValue = a.testName.toLowerCase();
          bValue = b.testName.toLowerCase();
          break;
        case 'fileName':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'status': {
          // Custom sort order for status: failed, timedOut, skipped, passed
          const statusOrder = { failed: 0, timedOut: 1, skipped: 2, passed: 3 };
          aValue = statusOrder[a.status] ?? 4;
          bValue = statusOrder[b.status] ?? 4;
          break;
        }
        default:
          aValue = a.testName.toLowerCase();
          bValue = b.testName.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [testResults, searchQuery, statusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return undefined;
    return sortOrder === 'asc' ? SortAsc : SortDesc;
  };

  // Statistics
  const stats = useMemo(() => {
    const total = filteredAndSortedResults.length;
    const passed = filteredAndSortedResults.filter(
      (r) => r.status === 'passed'
    ).length;
    const failed = filteredAndSortedResults.filter(
      (r) => r.status === 'failed'
    ).length;
    const skipped = filteredAndSortedResults.filter(
      (r) => r.status === 'skipped'
    ).length;
    const timedOut = filteredAndSortedResults.filter(
      (r) => r.status === 'timedOut'
    ).length;

    return { total, passed, failed, skipped, timedOut };
  }, [filteredAndSortedResults]);

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search tests by name or file..."
            value={searchQuery}
            onChange={setSearchQuery}
            icon={Search}
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="failed">Failed</option>
              <option value="passed">Passed</option>
              <option value="skipped">Skipped</option>
              <option value="timedOut">Timed Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-400 self-center">Sort by:</span>
        {[
          { field: 'testName' as const, label: 'Test Name' },
          { field: 'fileName' as const, label: 'File' },
          { field: 'duration' as const, label: 'Duration' },
          { field: 'status' as const, label: 'Status' },
        ].map(({ field, label }) => {
          const SortIcon = getSortIcon(field);
          const baseProps = {
            key: field,
            variant:
              sortField === field ? ('primary' as const) : ('ghost' as const),
            size: 'sm' as const,
            onClick: () => handleSort(field),
            iconPosition: 'right' as const,
            className: 'text-xs',
          };

          return SortIcon ? (
            <Button {...baseProps} icon={SortIcon}>
              {label}
            </Button>
          ) : (
            <Button {...baseProps}>{label}</Button>
          );
        })}
      </div>

      {/* Results Summary */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-gray-300">
            Showing {stats.total} of {testResults.length} tests
          </span>
          {stats.total > 0 && (
            <>
              <span className="text-green-400">{stats.passed} passed</span>
              <span className="text-red-400">{stats.failed} failed</span>
              {stats.skipped > 0 && (
                <span className="text-gray-400">{stats.skipped} skipped</span>
              )}
              {stats.timedOut > 0 && (
                <span className="text-yellow-400">
                  {stats.timedOut} timed out
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Results List */}
      {filteredAndSortedResults.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="text-gray-400 mb-2">No tests found</div>
          {searchQuery || statusFilter !== 'all' ? (
            <div className="text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              This test run doesn't contain any test results
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedResults.map((testResult) => {
            const itemProps: {
              key: string;
              testResult: TestResult;
              onViewMedia?: (type: 'screenshot' | 'video', url: string) => void;
            } = {
              key: testResult.id,
              testResult,
            };

            if (onViewMedia) {
              itemProps.onViewMedia = onViewMedia;
            }

            return <TestResultItem {...itemProps} />;
          })}
        </div>
      )}
    </div>
  );
}
