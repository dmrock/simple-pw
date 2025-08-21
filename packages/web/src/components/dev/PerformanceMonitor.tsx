import { useState, useEffect } from 'react';
import { PerformanceMonitor, getMemoryUsage } from '../../utils/performance';
import { env } from '../../config/env';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceMonitorComponent({
  enabled = env.DEV_MODE,
  position = 'bottom-right',
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [memoryUsage, setMemoryUsage] =
    useState<ReturnType<typeof getMemoryUsage>>(null);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const monitor = PerformanceMonitor.getInstance();
      setMetrics(monitor.getAllMetrics());
      setMemoryUsage(getMemoryUsage());
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-gray-600 text-white text-xs">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="w-full px-3 py-2 text-left hover:bg-gray-700 rounded-t-lg"
        >
          📊 Performance {isVisible ? '▼' : '▶'}
        </button>

        {isVisible && (
          <div className="p-3 max-w-sm max-h-96 overflow-auto">
            {/* Memory Usage */}
            {memoryUsage && (
              <div className="mb-3">
                <h4 className="font-semibold text-green-400 mb-1">
                  Memory Usage
                </h4>
                <div className="space-y-1">
                  <div>Used: {memoryUsage.used}MB</div>
                  <div>Total: {memoryUsage.total}MB</div>
                  <div>Limit: {memoryUsage.limit}MB</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(memoryUsage.used / memoryUsage.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Component Render Times */}
            <div className="mb-3">
              <h4 className="font-semibold text-blue-400 mb-1">Render Times</h4>
              {Object.keys(metrics).length === 0 ? (
                <div className="text-gray-400">No data yet</div>
              ) : (
                <div className="space-y-1">
                  {Object.entries(metrics).map(([component, data]) => {
                    if (!data) return null;
                    return (
                      <div key={component} className="flex justify-between">
                        <span className="truncate mr-2">{component}:</span>
                        <span
                          className={
                            data.average > 16
                              ? 'text-red-400'
                              : data.average > 8
                                ? 'text-yellow-400'
                                : 'text-green-400'
                          }
                        >
                          {data.average.toFixed(1)}ms
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const monitor = PerformanceMonitor.getInstance();
                  monitor.clearMetrics();
                  setMetrics({});
                }}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  console.log('Performance Metrics:', metrics);
                  console.log('Memory Usage:', memoryUsage);
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
              >
                Log
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for performance warnings
export function usePerformanceWarnings() {
  useEffect(() => {
    if (!env.DEV_MODE) return;

    const monitor = PerformanceMonitor.getInstance();

    const checkPerformance = () => {
      const metrics = monitor.getAllMetrics();

      Object.entries(metrics).forEach(([component, data]) => {
        if (data && data.average > 50) {
          console.warn(
            `🐌 Slow component detected: ${component} averages ${data.average.toFixed(1)}ms per render`
          );
        }
      });

      const memory = getMemoryUsage();
      if (memory && memory.used > memory.limit * 0.8) {
        console.warn(
          `🧠 High memory usage: ${memory.used}MB / ${memory.limit}MB (${((memory.used / memory.limit) * 100).toFixed(1)}%)`
        );
      }
    };

    const interval = setInterval(checkPerformance, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);
}

// Component for bundle size warnings
export function BundleSizeWarning() {
  const [bundleSize, setBundleSize] = useState<number | null>(null);

  useEffect(() => {
    if (!env.DEV_MODE) return;

    // Estimate bundle size from performance navigation API
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      const transferSize = navigation.transferSize || 0;
      setBundleSize(Math.round(transferSize / 1024)); // KB
    }
  }, []);

  if (!env.DEV_MODE || !bundleSize || bundleSize < 1000) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-yellow-900/90 border border-yellow-600 rounded-lg px-4 py-2 text-yellow-200 text-sm">
        ⚠️ Large bundle size detected: {bundleSize}KB
      </div>
    </div>
  );
}
