import { useEffect, useRef } from 'react';
import { useToast } from '../components/ui/Toast';
import { useConnectionStatus } from './useConnectionStatus';

export function useConnectionNotifications() {
  const { addToast } = useToast();
  const connectionStatus = useConnectionStatus();
  const previousConnectionRef = useRef(connectionStatus.isConnected);
  const previousOnlineRef = useRef(connectionStatus.isOnline);

  useEffect(() => {
    const wasConnected = previousConnectionRef.current;
    const wasOnline = previousOnlineRef.current;
    const isConnected = connectionStatus.isConnected;
    const isOnline = connectionStatus.isOnline;

    // Connection restored
    if (!wasConnected && isConnected && isOnline) {
      addToast({
        type: 'success',
        title: 'Connection Restored',
        message: 'Data will be automatically refreshed',
        duration: 3000,
      });
    }

    // Connection lost
    if (wasConnected && !isConnected && isOnline) {
      addToast({
        type: 'warning',
        title: 'Connection Issues',
        message: 'Trying to reconnect...',
        duration: 5000,
      });
    }

    // Went offline
    if (wasOnline && !isOnline) {
      addToast({
        type: 'error',
        title: 'No Internet Connection',
        message: 'Please check your network connection',
        duration: 0, // Don't auto-dismiss
      });
    }

    // Came back online
    if (!wasOnline && isOnline) {
      addToast({
        type: 'info',
        title: 'Back Online',
        message: 'Reconnecting to server...',
        duration: 3000,
      });
    }

    // Multiple failed connection attempts
    if (connectionStatus.retryCount >= 3 && !isConnected) {
      addToast({
        type: 'error',
        title: 'Connection Failed',
        message: 'Unable to connect to server after multiple attempts',
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'Retry Now',
          onClick: connectionStatus.retryConnection,
        },
      });
    }

    previousConnectionRef.current = isConnected;
    previousOnlineRef.current = isOnline;
  }, [
    connectionStatus.isConnected,
    connectionStatus.isOnline,
    connectionStatus.retryCount,
    connectionStatus.retryConnection,
    addToast,
  ]);

  return connectionStatus;
}
