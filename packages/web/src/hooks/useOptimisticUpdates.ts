import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from './useApi';
import type { TestRun, TestResult, PaginatedResponse } from '../types/api';

export function useOptimisticUpdates() {
  const queryClient = useQueryClient();

  // Optimistically update test run status
  const updateTestRunStatus = useCallback(
    (runId: string, status: TestRun['status']) => {
      // Update individual test run
      queryClient.setQueryData(
        queryKeys.testRun(runId),
        (old: TestRun | undefined) => {
          if (!old) return old;
          return { ...old, status };
        }
      );

      // Update test runs list
      queryClient.setQueriesData(
        { queryKey: ['testRuns'], exact: false },
        (old: PaginatedResponse<TestRun> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((run) =>
              run.id === runId ? { ...run, status } : run
            ),
          };
        }
      );
    },
    [queryClient]
  );

  // Optimistically add new test run
  const addTestRun = useCallback(
    (newRun: TestRun) => {
      queryClient.setQueriesData(
        { queryKey: ['testRuns'], exact: false },
        (old: PaginatedResponse<TestRun> | undefined) => {
          if (!old) return old;

          // Add to the beginning of the list (most recent first)
          const updatedData = [newRun, ...old.data];

          return {
            ...old,
            data: updatedData,
            total: old.total + 1,
          };
        }
      );
    },
    [queryClient]
  );

  // Optimistically update test result
  const updateTestResult = useCallback(
    (runId: string, resultId: string, updates: Partial<TestResult>) => {
      // Update individual test result
      queryClient.setQueryData(
        queryKeys.testResult(runId, resultId),
        (old: TestResult | undefined) => {
          if (!old) return old;
          return { ...old, ...updates };
        }
      );

      // Update test results list
      queryClient.setQueryData(
        queryKeys.testResults(runId),
        (old: TestResult[] | undefined) => {
          if (!old) return old;
          return old.map((result) =>
            result.id === resultId ? { ...result, ...updates } : result
          );
        }
      );

      // Update test run with updated results
      queryClient.setQueryData(
        queryKeys.testRun(runId),
        (old: TestRun | undefined) => {
          if (!old) return old;
          return {
            ...old,
            results: old.results.map((result) =>
              result.id === resultId ? { ...result, ...updates } : result
            ),
          };
        }
      );
    },
    [queryClient]
  );

  // Revert optimistic updates on error
  const revertOptimisticUpdate = useCallback(
    (queryKey: unknown[]) => {
      queryClient.invalidateQueries({ queryKey });
    },
    [queryClient]
  );

  // Batch invalidate related queries
  const invalidateRelatedQueries = useCallback(
    (runId?: string) => {
      if (runId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.testRun(runId) });
        queryClient.invalidateQueries({
          queryKey: queryKeys.testResults(runId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['testRuns'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['analytics'], exact: false });
    },
    [queryClient]
  );

  return {
    updateTestRunStatus,
    addTestRun,
    updateTestResult,
    revertOptimisticUpdate,
    invalidateRelatedQueries,
  };
}
