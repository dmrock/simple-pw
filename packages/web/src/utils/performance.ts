import { useEffect, useRef } from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track component render time
  trackRender(componentName: string, renderTime: number) {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }

    const times = this.metrics.get(componentName)!;
    times.push(renderTime);

    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }

    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(
        `Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }
  }

  // Get performance metrics for a component
  getMetrics(componentName: string) {
    const times = this.metrics.get(componentName) || [];
    if (times.length === 0) return null;

    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    return {
      average: avg,
      max,
      min,
      count: times.length,
    };
  }

  // Get all metrics
  getAllMetrics() {
    const result: Record<string, ReturnType<typeof this.getMetrics>> = {};
    for (const [componentName] of this.metrics) {
      result[componentName] = this.getMetrics(componentName);
    }
    return result;
  }

  // Clear metrics
  clearMetrics(componentName?: string) {
    if (componentName) {
      this.metrics.delete(componentName);
    } else {
      this.metrics.clear();
    }
  }
}

// Hook to measure component render performance
export function useRenderPerformance(componentName: string) {
  const renderStartRef = useRef<number>();
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      monitor.trackRender(componentName, renderTime);
    }
  });

  return {
    getMetrics: () => monitor.getMetrics(componentName),
    clearMetrics: () => monitor.clearMetrics(componentName),
  };
}

// Memory usage monitoring
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  return null;
}

// Bundle size tracking
export function trackBundleLoad(chunkName: string) {
  const startTime = performance.now();

  return () => {
    const loadTime = performance.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.log(`Chunk "${chunkName}" loaded in ${loadTime.toFixed(2)}ms`);
    }
  };
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization utility for expensive computations
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return result;
  }) as T;
}
