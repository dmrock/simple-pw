import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
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

// Real-time polling configuration
interface PollingOptions {
  enabled?: boolean;
  pollingInterval?: number;
  enablePolling?: boolean;
  refetchOnWindowFocus?: boolean;
}

// Smart polling hook that adjusts interval based on activity
function useSmartPolling(
  refetch: () => void,
  options: {
    interval?: number;
    enabled?: boolean;
    onError?: (error: Error) => void;
  } = {}
) {
  const { interval = 30000, enabled = true, onError } = options;
  const intervalRef = useRef<number>();
  const lastActivityRef = useRef(Date.now());
  const consecutiveErrorsRef = useRef(0);

  // Track user activity
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    const handleActivity = () => updateActivity();

    // Listen for user activity
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [updateActivity]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      return;
    }

    const poll = async () => {
      try {
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        const isInactive = timeSinceActivity > 5 * 60 * 1000; // 5 minutes

        // Skip polling if user has been inactive for too long
        if (isInactive) {
          return;
        }

        await refetch();
        consecutiveErrorsRef.current = 0;
      } catch (error) {
        consecutiveErrorsRef.current += 1;
        onError?.(error as Error);

        // Exponential backoff on consecutive errors
        if (consecutiveErrorsRef.current >= 3) {
          // Stop polling after 3 consecutive errors
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
          }
          return;
        }
      }
    };

    // Calculate dynamic interval based on errors
    const dynamicInterval = Math.min(
      interval * Math.pow(2, consecutiveErrorsRef.current),
      5 * 60 * 1000 // Max 5 minutes
    );

    intervalRef.current = window.setInterval(poll, dynamicInterval);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, refetch, onError]);

  return { updateActivity };
}

// Test Runs hooks
export function useTestRuns(
  filters: TestRunFilters = {},
  options: PollingOptions = {}
) {
  const {
    enabled = true,
    pollingInterval = 30000,
    enablePolling = true,
    refetchOnWindowFocus = false,
  } = options;

  const query = useQuery({
    queryKey: queryKeys.testRuns(filters),
    queryFn: () => ApiService.getTestRuns(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled,
    refetchOnWindowFocus,
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (
        error &&
        'code' in error &&
        typeof error.code === 'string' &&
        error.code.startsWith('HTTP_4')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Smart polling
  useSmartPolling(query.refetch, {
    interval: pollingInterval,
    enabled: enablePolling && enabled && !query.isError,
    onError: (error) => {
      console.warn('Polling error for test runs:', error);
    },
  });

  return query;
}

export function useTestRun(
  id: string,
  options: PollingOptions & { enabled?: boolean } = {}
) {
  const {
    enabled = true,
    pollingInterval = 60000, // 1 minute for individual test runs
    enablePolling = false, // Disabled by default for individual runs
    refetchOnWindowFocus = false,
  } = options;

  const query = useQuery({
    queryKey: queryKeys.testRun(id),
    queryFn: () => ApiService.getTestRun(id),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: enabled && !!id,
    refetchOnWindowFocus,
    retry: (failureCount, error) => {
      if (
        error &&
        'code' in error &&
        typeof error.code === 'string' &&
        error.code.startsWith('HTTP_4')
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Optional polling for test run details
  useSmartPolling(query.refetch, {
    interval: pollingInterval,
    enabled: enablePolling && enabled && !!id && !query.isError,
    onError: (error) => {
      console.warn('Polling error for test run:', error);
    },
  });

  return query;
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
  options: PollingOptions = {}
) {
  const {
    enabled = true,
    pollingInterval = 60000, // 1 minute for analytics
    enablePolling = true,
    refetchOnWindowFocus = false,
  } = options;

  const query = useQuery({
    queryKey: queryKeys.analytics(dateRange),
    queryFn: () => ApiService.getAnalytics(dateRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled,
    refetchOnWindowFocus,
    retry: (failureCount, error) => {
      if (
        error &&
        'code' in error &&
        typeof error.code === 'string' &&
        error.code.startsWith('HTTP_4')
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Smart polling for analytics
  useSmartPolling(query.refetch, {
    interval: pollingInterval,
    enabled: enablePolling && enabled && !query.isError,
    onError: (error) => {
      console.warn('Polling error for analytics:', error);
    },
  });

  return query;
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
