import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '../types/api';

interface ErrorState {
  error: Error | ApiError | null;
  isRetrying: boolean;
  retryCount: number;
  lastRetryAt: Date | null;
}

interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error | ApiError) => void;
  onRetry?: () => void;
  onMaxRetriesReached?: () => void;
  enableAutoRetry?: boolean;
  retryableErrors?: string[];
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry,
    onMaxRetriesReached,
    enableAutoRetry = false,
    retryableErrors = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'],
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    lastRetryAt: null,
  });

  const queryClient = useQueryClient();

  const isRetryableError = useCallback(
    (error: Error | ApiError): boolean => {
      if ('code' in error && error.code) {
        return retryableErrors.includes(error.code);
      }

      // Check for common retryable error patterns
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('fetch') ||
        message.includes('connection') ||
        message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')
      );
    },
    [retryableErrors]
  );

  const handleError = useCallback(
    (error: Error | ApiError) => {
      console.error('Error handled:', error);

      setErrorState((prev) => ({
        ...prev,
        error,
        retryCount: 0, // Reset retry count for new errors
      }));

      onError?.(error);
    },
    [onError]
  );

  const retry = useCallback(
    async (retryFn?: () => Promise<void> | void) => {
      const { error, retryCount } = errorState;

      if (!error || retryCount >= maxRetries) {
        if (retryCount >= maxRetries) {
          onMaxRetriesReached?.();
        }
        return;
      }

      setErrorState((prev) => ({
        ...prev,
        isRetrying: true,
        retryCount: prev.retryCount + 1,
        lastRetryAt: new Date(),
      }));

      onRetry?.();

      try {
        if (retryFn) {
          await retryFn();
        } else {
          // Default retry behavior: invalidate all queries
          await queryClient.invalidateQueries();
        }

        // Success - clear error state
        setErrorState({
          error: null,
          isRetrying: false,
          retryCount: 0,
          lastRetryAt: null,
        });
      } catch (newError) {
        const error =
          newError instanceof Error ? newError : new Error(String(newError));

        setErrorState((prev) => ({
          ...prev,
          error,
          isRetrying: false,
        }));

        // Auto retry with exponential backoff if enabled
        if (
          enableAutoRetry &&
          errorState.retryCount < maxRetries - 1 &&
          isRetryableError(error)
        ) {
          const delay = retryDelay * Math.pow(2, errorState.retryCount);
          setTimeout(() => retry(retryFn), delay);
        }
      }
    },
    [
      errorState,
      maxRetries,
      retryDelay,
      enableAutoRetry,
      isRetryableError,
      onRetry,
      onMaxRetriesReached,
      queryClient,
    ]
  );

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      lastRetryAt: null,
    });
  }, []);

  const getErrorMessage = useCallback(
    (error?: Error | ApiError | null): string => {
      if (!error) return '';

      if ('code' in error && error.code) {
        switch (error.code) {
          case 'NETWORK_ERROR':
            return 'Network connection failed. Please check your internet connection.';
          case 'TIMEOUT_ERROR':
            return 'Request timed out. Please try again.';
          case 'HTTP_401':
            return 'Authentication required. Please log in again.';
          case 'HTTP_403':
            return 'Access denied. You do not have permission to perform this action.';
          case 'HTTP_404':
            return 'The requested resource was not found.';
          case 'HTTP_500':
            return 'Server error. Please try again later.';
          case 'HTTP_503':
            return 'Service temporarily unavailable. Please try again later.';
          default:
            return error.message || 'An unexpected error occurred.';
        }
      }

      return error.message || 'An unexpected error occurred.';
    },
    []
  );

  const getErrorSeverity = useCallback(
    (error?: Error | ApiError | null): 'low' | 'medium' | 'high' => {
      if (!error) return 'low';

      if ('code' in error && error.code) {
        if (error.code.startsWith('HTTP_4')) return 'medium';
        if (error.code.startsWith('HTTP_5')) return 'high';
        if (['NETWORK_ERROR', 'TIMEOUT_ERROR'].includes(error.code))
          return 'medium';
      }

      return 'high';
    },
    []
  );

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    lastRetryAt: errorState.lastRetryAt,
    canRetry: errorState.retryCount < maxRetries && !errorState.isRetrying,
    hasMaxRetries: errorState.retryCount >= maxRetries,
    isRetryableError: errorState.error
      ? isRetryableError(errorState.error)
      : false,
    handleError,
    retry,
    clearError,
    getErrorMessage,
    getErrorSeverity,
  };
}

// Specialized error handlers for common scenarios
export function useApiErrorHandler() {
  return useErrorHandler({
    maxRetries: 3,
    retryDelay: 1000,
    enableAutoRetry: false,
    retryableErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'HTTP_500',
      'HTTP_502',
      'HTTP_503',
      'HTTP_504',
    ],
  });
}

export function useNetworkErrorHandler() {
  return useErrorHandler({
    maxRetries: 5,
    retryDelay: 2000,
    enableAutoRetry: true,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR'],
  });
}
