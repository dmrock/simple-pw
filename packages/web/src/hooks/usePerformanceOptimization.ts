import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { debounce, throttle, memoize } from '../utils/performance';

// Hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for throttled callbacks
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  return throttledCallback as T;
}

// Hook for debounced callbacks
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  immediate = false
): T {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay, immediate),
    [callback, delay, immediate]
  );

  return debouncedCallback as T;
}

// Hook for memoized expensive computations
export function useMemoizedComputation<T, Args extends unknown[]>(
  computation: (...args: Args) => T,
  deps: Args
): T {
  const memoizedComputation = useMemo(
    () => memoize(computation),
    [computation]
  );

  return useMemo(
    () => memoizedComputation(...deps),
    [memoizedComputation, ...deps]
  );
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const isIntersecting = entry.isIntersecting;
        setIsIntersecting(isIntersecting);

        if (isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, options]);

  return {
    targetRef,
    isIntersecting,
    hasIntersected,
  };
}

// Hook for virtual scrolling optimization
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
  };
}

// Hook for image lazy loading
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver();

  useEffect(() => {
    if (!hasIntersected) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setIsError(true);
    };
    img.src = src;
  }, [src, hasIntersected]);

  return {
    imageSrc,
    isLoaded,
    isError,
    targetRef,
  };
}

// Hook for component size optimization
export function useComponentSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(target);

    return () => {
      resizeObserver.unobserve(target);
    };
  }, []);

  return {
    targetRef,
    size,
  };
}

// Hook for performance-aware state updates
export function usePerformantState<T>(
  initialValue: T,
  shouldUpdate?: (prev: T, next: T) => boolean
) {
  const [state, setState] = useState(initialValue);
  const previousValueRef = useRef(initialValue);

  const setPerformantState = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(prev)
            : newValue;

        // Use custom comparison if provided, otherwise use Object.is
        const hasChanged = shouldUpdate
          ? shouldUpdate(prev, next)
          : !Object.is(prev, next);

        if (hasChanged) {
          previousValueRef.current = prev;
          return next;
        }

        return prev;
      });
    },
    [shouldUpdate]
  );

  return [state, setPerformantState, previousValueRef.current] as const;
}
