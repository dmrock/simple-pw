import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { TestRunFilters, DateRange } from '../types/api';

// Query keys for consistent caching
export const queryKeys = {
  testRuns: (filters: TestRunFilters) => ['testRuns', filters] as const,
  testRun: (id: string) => ['testRun', id] as const,
  testResults: (runId: string) => ['testResults', runId] as const,
  testResult: (runId: string, resultId: string) =>
    ['testResult', runId, resultId] as const,
  analytics: (dateRange?: DateRange) => ['analytics', dateRange] as const,
  testHistory: (testName: string, dateRange?: DateRange) =>
    ['testHistory', testName, dateRange] as const,
  health: () => ['health'] as const,
};

// Test Runs hooks
export function useTestRuns(
  filters: TestRunFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.testRuns(filters),
    queryFn: () => ApiService.getTestRuns(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...(options?.enabled !== undefined && { enabled: options.enabled }),
  });
}

export function useTestRun(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.testRun(id),
    queryFn: () => ApiService.getTestRun(id),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && !!id,
  });
}

// Test Results hooks
export function useTestResults(runId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.testResults(runId),
    queryFn: () => ApiService.getTestResults(runId),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && !!runId,
  });
}

export function useTestResult(
  runId: string,
  resultId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.testResult(runId, resultId),
    queryFn: () => ApiService.getTestResult(runId, resultId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: (options?.enabled ?? true) && !!runId && !!resultId,
  });
}

// Analytics hooks
export function useAnalytics(
  dateRange?: DateRange,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.analytics(dateRange),
    queryFn: () => ApiService.getAnalytics(dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...(options?.enabled !== undefined && { enabled: options.enabled }),
  });
}

// Test History hooks
export function useTestHistory(
  testName: string,
  dateRange?: DateRange,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.testHistory(testName, dateRange),
    queryFn: () => ApiService.getTestHistory(testName, dateRange),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && !!testName,
  });
}

// Health check hook
export function useHealthCheck(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: () => ApiService.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: options?.refetchInterval || 60 * 1000, // 1 minute
    ...(options?.enabled !== undefined && { enabled: options.enabled }),
  });
}

// Utility hooks for data manipulation
export function useRefreshTestRuns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filters: TestRunFilters = {}) => {
      await queryClient.invalidateQueries({
        queryKey: ['testRuns'],
        exact: false,
      });
      return ApiService.getTestRuns(filters);
    },
  });
}

export function useRefreshAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dateRange?: DateRange) => {
      await queryClient.invalidateQueries({
        queryKey: ['analytics'],
        exact: false,
      });
      return ApiService.getAnalytics(dateRange);
    },
  });
}

// Prefetch utilities
export function usePrefetchTestRun() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.testRun(id),
      queryFn: () => ApiService.getTestRun(id),
      staleTime: 60 * 1000,
    });
  };
}

export function usePrefetchTestResults() {
  const queryClient = useQueryClient();

  return (runId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.testResults(runId),
      queryFn: () => ApiService.getTestResults(runId),
      staleTime: 60 * 1000,
    });
  };
}
