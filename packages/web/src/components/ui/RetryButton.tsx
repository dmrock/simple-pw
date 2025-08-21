import React, { useState, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  error?: Error | string | null | { message: string };
  maxRetries?: number;
  retryDelay?: number;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showError?: boolean;
  autoRetry?: boolean;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  error,
  maxRetries = 3,
  retryDelay = 1000,
  className = '',
  variant = 'outline',
  size = 'md',
  showError = true,
  autoRetry = false,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleRetry = useCallback(async () => {
    if (isRetrying || retryCount >= maxRetries) return;

    setIsRetrying(true);
    setLastError(null);

    try {
      await onRetry();
      setRetryCount(0); // Reset on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setLastError(errorMessage);
      setRetryCount((prev) => prev + 1);

      // Auto retry with exponential backoff
      if (autoRetry && retryCount < maxRetries - 1) {
        const delay = retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          handleRetry();
        }, delay);
      }
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying, retryCount, maxRetries, retryDelay, autoRetry]);

  const getButtonText = () => {
    if (isRetrying) return 'Retrying...';
    if (retryCount >= maxRetries) return 'Max retries reached';
    if (retryCount > 0) return `Retry (${retryCount}/${maxRetries})`;
    return 'Retry';
  };

  const displayError = error || lastError;
  const isDisabled = isRetrying || retryCount >= maxRetries;

  const getErrorMessage = (err: typeof displayError): string => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && 'message' in err) return err.message;
    return String(err);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {showError && displayError && (
        <div className="flex items-start space-x-2 p-3 bg-red-900/20 border border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-300">
            <p className="font-medium">Error occurred</p>
            <p className="text-red-400 mt-1">{getErrorMessage(displayError)}</p>
          </div>
        </div>
      )}

      <Button
        variant={variant}
        size={size}
        onClick={handleRetry}
        disabled={isDisabled}
        loading={isRetrying}
        icon={RefreshCw}
        className="w-full sm:w-auto"
      >
        {getButtonText()}
      </Button>

      {retryCount > 0 && retryCount < maxRetries && (
        <p className="text-xs text-gray-400 text-center">
          {maxRetries - retryCount} attempts remaining
        </p>
      )}
    </div>
  );
};

// Hook for managing retry logic
export function useRetry(
  operation: () => Promise<void> | void,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: Error) => void;
    onSuccess?: () => void;
  } = {}
) {
  const { maxRetries = 3, onError, onSuccess } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const retry = useCallback(async () => {
    if (isRetrying || retryCount >= maxRetries) return;

    setIsRetrying(true);
    setError(null);

    try {
      await operation();
      setRetryCount(0);
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setRetryCount((prev) => prev + 1);
      onError?.(error);
    } finally {
      setIsRetrying(false);
    }
  }, [operation, isRetrying, retryCount, maxRetries, onError, onSuccess]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setError(null);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    reset,
    isRetrying,
    retryCount,
    error,
    canRetry: retryCount < maxRetries && !isRetrying,
    hasMaxRetries: retryCount >= maxRetries,
  };
}
