import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../services/api';

interface ConnectionStatus {
  isOnline: boolean;
  isConnected: boolean;
  lastConnected: Date | null;
  retryCount: number;
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    isConnected: true,
    lastConnected: new Date(),
    retryCount: 0,
  });

  const queryClient = useQueryClient();

  // Check API connectivity
  const checkConnection = useCallback(async () => {
    try {
      await ApiService.healthCheck();
      setStatus((prev) => ({
        ...prev,
        isConnected: true,
        lastConnected: new Date(),
        retryCount: 0,
      }));
      return true;
    } catch (error) {
      console.warn('Connection check failed:', error);
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        retryCount: prev.retryCount + 1,
      }));
      return false;
    }
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
      checkConnection();
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false, isConnected: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Periodic connection check
  useEffect(() => {
    if (!status.isOnline) return;

    const interval = window.setInterval(() => {
      checkConnection();
    }, 30000); // Check every 30 seconds

    return () => window.clearInterval(interval);
  }, [status.isOnline, checkConnection]);

  // Retry connection with exponential backoff
  const retryConnection = useCallback(async () => {
    const delay = Math.min(1000 * Math.pow(2, status.retryCount), 30000);

    window.setTimeout(async () => {
      const connected = await checkConnection();
      if (connected) {
        // Invalidate all queries to refresh data
        queryClient.invalidateQueries();
      }
    }, delay);
  }, [status.retryCount, checkConnection, queryClient]);

  return {
    ...status,
    checkConnection,
    retryConnection,
  };
}
