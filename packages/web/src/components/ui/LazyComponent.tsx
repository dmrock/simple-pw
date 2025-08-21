import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { trackBundleLoad } from '../../utils/performance';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  chunkName?: string;
}

// Higher-order component for lazy loading with performance tracking
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentProps = {}
) {
  const {
    fallback = (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <LoadingSpinner size="md" color="white" />
          <p className="mt-2 text-sm text-gray-400">Loading component...</p>
        </div>
      </div>
    ),
    errorFallback = (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-400">Failed to load component</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Reload page
          </button>
        </div>
      </div>
    ),
    chunkName = 'unknown',
  } = options;

  // Create lazy component with performance tracking
  const LazyComponent = lazy(async () => {
    const trackLoad = trackBundleLoad(chunkName);
    try {
      const module = await importFn();
      trackLoad();
      return module;
    } catch (error) {
      trackLoad();
      throw error;
    }
  });

  // Return wrapped component
  return React.forwardRef<unknown, P>((props, ref) => (
    <ErrorBoundary
      level="component"
      fallback={errorFallback}
      onError={(error) => {
        console.error(`Error loading lazy component "${chunkName}":`, error);
      }}
    >
      <Suspense fallback={fallback}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </ErrorBoundary>
  ));
}

// Lazy wrapper component for conditional loading
interface ConditionalLazyProps extends LazyComponentProps {
  condition: boolean;
  children: React.ReactNode;
}

export function ConditionalLazy({
  condition,
  children,
  fallback,
  errorFallback,
  chunkName = 'conditional',
}: ConditionalLazyProps) {
  if (!condition) {
    return null;
  }

  return (
    <ErrorBoundary
      level="component"
      fallback={errorFallback}
      onError={(error) => {
        console.error(
          `Error in conditional lazy component "${chunkName}":`,
          error
        );
      }}
    >
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// Hook for lazy loading components based on intersection
export function useLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentProps & { threshold?: number } = {}
) {
  const { threshold = 0.1, chunkName = 'intersection-lazy' } = options;
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const [Component, setComponent] = React.useState<ComponentType<P> | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const targetRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const target = targetRef.current;
    if (!target || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.unobserve(target);
        }
      },
      { threshold }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [shouldLoad, threshold]);

  React.useEffect(() => {
    if (!shouldLoad || Component || isLoading) return;

    setIsLoading(true);
    setError(null);

    const trackLoad = trackBundleLoad(chunkName);

    importFn()
      .then((module) => {
        setComponent(() => module.default);
        trackLoad();
      })
      .catch((err) => {
        setError(err);
        trackLoad();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [shouldLoad, Component, isLoading, importFn, chunkName]);

  return {
    targetRef,
    Component,
    isLoading,
    error,
    shouldLoad,
  };
}

// Preload utility for critical components
export function preloadComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  chunkName = 'preload'
) {
  const trackLoad = trackBundleLoad(chunkName);

  return importFn()
    .then((module) => {
      trackLoad();
      return module;
    })
    .catch((error) => {
      trackLoad();
      console.warn(`Failed to preload component "${chunkName}":`, error);
      throw error;
    });
}

// Component for progressive enhancement
interface ProgressiveEnhancementProps {
  baseline: React.ReactNode;
  enhanced: React.ReactNode;
  condition?: boolean;
  delay?: number;
}

export function ProgressiveEnhancement({
  baseline,
  enhanced,
  condition = true,
  delay = 0,
}: ProgressiveEnhancementProps) {
  const [showEnhanced, setShowEnhanced] = React.useState(!delay);

  React.useEffect(() => {
    if (delay > 0 && condition) {
      const timer = setTimeout(() => {
        setShowEnhanced(true);
      }, delay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [delay, condition]);

  if (!condition || !showEnhanced) {
    return <>{baseline}</>;
  }

  return <>{enhanced}</>;
}
