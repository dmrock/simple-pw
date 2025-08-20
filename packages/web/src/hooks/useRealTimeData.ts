import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConnectionStatus } from './useConnectionStatus';
import { useOptimisticUpdates } from './useOptimisticUpdates';
import { queryKeys } from './useApi';
import type { TestRunFilters, DateRange } from '../types/api';

interface RealTimeDataOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
  enableOptimisticUpdates?: boolean;
  onConnectionChange?: (isConnected: boolean) => void;
  onDataUpdate?: () => void;
}

export function useRealTimeData(
  page: 'testRuns' | 'analytics' | 'testRunDetails',
  options: RealTimeDataOptions & {
    filters?: TestRunFilters;
    dateRange?: DateRange;
    runId?: string;
  } = {}
) {
  const {
    enableOptimisticUpdates = true,
    onConnectionChange,
    onDataUpdate,
    filters,
    dateRange,
    runId,
  } = options;

  const queryClient = useQueryClient();
  const connectionStatus = useConnectionStatus();
  const optimisticUpdates = useOptimisticUpdates();
  const lastUpdateRef = useRef<Date>(new Date());

  // Handle connection status changes
  useEffect(() => {
    onConnectionChange?.(connectionStatus.isConnected);
  }, [connectionStatus.isConnected, onConnectionChange]);

  // Smart refresh based on page type
  const refreshData = useCallback(async () => {
    try {
      switch (page) {
        case 'testRuns':
          await queryClient.invalidateQueries({
            queryKey: queryKeys.testRuns(filters || {}),
          });
          break;
        case 'analytics':
          await queryClient.invalidateQueries({
            queryKey: queryKeys.analytics(dateRange),
          });
          break;
        case 'testRunDetails':
          if (runId) {
            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: queryKeys.testRun(runId),
              }),
              queryClient.invalidateQueries({
                queryKey: queryKeys.testResults(runId),
              }),
            ]);
          }
          break;
      }

      lastUpdateRef.current = new Date();
      onDataUpdate?.();
    } catch (error) {
      console.warn('Failed to refresh data:', error);
    }
  }, [page, queryClient, filters, dateRange, runId, onDataUpdate]);

  // Auto-refresh when connection is restored
  useEffect(() => {
    if (connectionStatus.isConnected && connectionStatus.retryCount > 0) {
      refreshData();
    }
  }, [connectionStatus.isConnected, connectionStatus.retryCount, refreshData]);

  // Visibility change handling - refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && connectionStatus.isConnected) {
        const timeSinceLastUpdate =
          Date.now() - lastUpdateRef.current.getTime();
        // Refresh if it's been more than 1 minute since last update
        if (timeSinceLastUpdate > 60000) {
          refreshData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connectionStatus.isConnected, refreshData]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    if (!connectionStatus.isConnected) {
      await connectionStatus.retryConnection();
    } else {
      await refreshData();
    }
  }, [connectionStatus, refreshData]);

  // Get time since last update
  const getTimeSinceLastUpdate = useCallback(() => {
    return Date.now() - lastUpdateRef.current.getTime();
  }, []);

  return {
    connectionStatus,
    optimisticUpdates: enableOptimisticUpdates ? optimisticUpdates : null,
    refreshData: manualRefresh,
    getTimeSinceLastUpdate,
    lastUpdate: lastUpdateRef.current,
  };
}
