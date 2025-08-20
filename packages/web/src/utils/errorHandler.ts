// Global error handling utilities

export interface GlobalErrorHandler {
  handleError: (error: Error, context?: string) => void;
  handleUnhandledRejection: (event: PromiseRejectionEvent) => void;
  handleJavaScriptError: (event: ErrorEvent) => void;
}

class ErrorHandlerService implements GlobalErrorHandler {
  private errorQueue: Array<{
    error: Error;
    context?: string;
    timestamp: Date;
  }> = [];
  private maxQueueSize = 50;

  handleError(error: Error, context?: string): void {
    const errorEntry = {
      error,
      context,
      timestamp: new Date(),
    };

    // Add to queue
    this.errorQueue.push(errorEntry);

    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log error
    console.error(`[${context || 'Unknown'}] Error:`, error);

    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      this.reportError(errorEntry);
    }
  }

  handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

    this.handleError(error, 'Unhandled Promise Rejection');

    // Prevent the default browser behavior
    event.preventDefault();
  }

  handleJavaScriptError(event: ErrorEvent): void {
    const error = event.error || new Error(event.message);
    this.handleError(error, 'JavaScript Error');
  }

  private reportError(errorEntry: {
    error: Error;
    context?: string;
    timestamp: Date;
  }): void {
    // TODO: Implement error reporting to external service (e.g., Sentry)
    // For now, just log to console in production
    console.error('Production error:', {
      message: errorEntry.error.message,
      stack: errorEntry.error.stack,
      context: errorEntry.context,
      timestamp: errorEntry.timestamp.toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  getRecentErrors(
    limit = 10
  ): Array<{ error: Error; context?: string; timestamp: Date }> {
    return this.errorQueue.slice(-limit);
  }

  clearErrors(): void {
    this.errorQueue = [];
  }
}

// Create singleton instance
export const globalErrorHandler = new ErrorHandlerService();

// Setup global error handlers
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    globalErrorHandler.handleUnhandledRejection(event);
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    globalErrorHandler.handleJavaScriptError(event);
  });

  // Handle resource loading errors
  window.addEventListener(
    'error',
    (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        const error = new Error(`Failed to load resource: ${target.tagName}`);
        globalErrorHandler.handleError(error, 'Resource Loading Error');
      }
    },
    true
  );
}

// Utility functions for common error scenarios
export function handleChunkLoadError(error: Error): void {
  // Handle code splitting chunk load errors
  if (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Loading chunk')
  ) {
    // Reload the page to get the latest chunks
    window.location.reload();
  } else {
    globalErrorHandler.handleError(error, 'Chunk Load Error');
  }
}

export function handleNetworkError(error: Error): void {
  globalErrorHandler.handleError(error, 'Network Error');
}

export function handleApiError(error: Error): void {
  globalErrorHandler.handleError(error, 'API Error');
}
