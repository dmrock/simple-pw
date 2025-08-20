import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  globalErrorHandler,
  setupGlobalErrorHandling,
  handleChunkLoadError,
  handleNetworkError,
  handleApiError,
} from '../errorHandler';

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Clear error queue before each test
    globalErrorHandler.clearErrors();

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('globalErrorHandler', () => {
    it('should handle errors and add them to queue', () => {
      const error = new Error('Test error');
      const context = 'Test context';

      globalErrorHandler.handleError(error, context);

      const recentErrors = globalErrorHandler.getRecentErrors();
      expect(recentErrors).toHaveLength(1);

      const firstError = recentErrors[0];
      expect(firstError).toBeDefined();
      expect(firstError!.error).toBe(error);
      expect(firstError!.context).toBe(context);
      expect(firstError!.timestamp).toBeInstanceOf(Date);
    });

    it('should limit error queue size', () => {
      // Add more errors than the max queue size (50)
      for (let i = 0; i < 60; i++) {
        globalErrorHandler.handleError(new Error(`Error ${i}`));
      }

      const recentErrors = globalErrorHandler.getRecentErrors(60);
      expect(recentErrors.length).toBeLessThanOrEqual(50);

      // Should keep the most recent errors
      const lastError = recentErrors[recentErrors.length - 1];
      expect(lastError).toBeDefined();
      expect(lastError!.error.message).toBe('Error 59');
    });

    it('should clear errors', () => {
      globalErrorHandler.handleError(new Error('Test error'));
      expect(globalErrorHandler.getRecentErrors()).toHaveLength(1);

      globalErrorHandler.clearErrors();
      expect(globalErrorHandler.getRecentErrors()).toHaveLength(0);
    });

    it('should handle JavaScript errors', () => {
      const error = new Error('JS error');

      // Test the method directly by calling handleError with JavaScript Error context
      globalErrorHandler.handleError(error, 'JavaScript Error');

      const recentErrors = globalErrorHandler.getRecentErrors();
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0]!.context).toBe('JavaScript Error');
      expect(recentErrors[0]!.error).toBe(error);
    });
  });

  describe('setupGlobalErrorHandling', () => {
    it('should setup global error event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      setupGlobalErrorHandling();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });
  });

  describe('utility error handlers', () => {
    it('should handle regular errors in chunk handler', () => {
      const regularError = new Error('Regular error');

      handleChunkLoadError(regularError);

      const recentErrors = globalErrorHandler.getRecentErrors();
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0]!.context).toBe('Chunk Load Error');
    });

    it('should handle network errors', () => {
      const networkError = new Error('Network error');

      handleNetworkError(networkError);

      const recentErrors = globalErrorHandler.getRecentErrors();
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0]!.context).toBe('Network Error');
    });

    it('should handle API errors', () => {
      const apiError = new Error('API error');

      handleApiError(apiError);

      const recentErrors = globalErrorHandler.getRecentErrors();
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0]!.context).toBe('API Error');
    });
  });

  describe('production behavior', () => {
    it('should log errors to console', () => {
      const error = new Error('Test error');
      globalErrorHandler.handleError(error, 'Test context');

      // Should have logged the error
      expect(console.error).toHaveBeenCalledWith(
        '[Test context] Error:',
        error
      );
    });
  });
});
