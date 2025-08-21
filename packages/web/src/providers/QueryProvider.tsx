import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { env } from '../config/env';

// Enhanced cache configuration for different data types
const getCacheConfig = (dataType: 'static' | 'dynamic' | 'realtime') => {
  switch (dataType) {
    case 'static':
      // For rarely changing data (e.g., test history)
      return {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      };
    case 'dynamic':
      // For moderately changing data (e.g., analytics)
      return {
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      };
    case 'realtime':
      // For frequently changing data (e.g., test runs)
      return {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
      };
    default:
      return {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
      };
  }
};

// Create a client with optimized defaults and enhanced caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global defaults for all queries (realtime by default)
      ...getCacheConfig('realtime'),
      retry: (failureCount, error: Error) => {
        // Don't retry on 4xx errors (client errors)
        if (
          'code' in error &&
          typeof error.code === 'string' &&
          error.code.startsWith('HTTP_4')
        ) {
          return false;
        }
        // Retry up to 3 times for other errors with exponential backoff
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s, max 30s
        return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
      },
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts
      // Network mode for better offline handling
      networkMode: 'online',
      // Enable background refetching for better UX
      refetchInterval: false, // Disabled by default, enabled per query
      refetchIntervalInBackground: false,
      // Optimize for performance
      structuralSharing: true, // Enable structural sharing for better performance
      // Persist queries in background
      notifyOnChangeProps: 'all', // Only notify when tracked props change
    },
    mutations: {
      retry: (failureCount, error: Error) => {
        // Don't retry mutations on client errors
        if (
          'code' in error &&
          typeof error.code === 'string' &&
          error.code.startsWith('HTTP_4')
        ) {
          return false;
        }
        return failureCount < 2;
      },
      networkMode: 'online',
    },
  },
});

// Add query-specific cache configurations
queryClient.setQueryDefaults(['analytics'], getCacheConfig('dynamic'));
queryClient.setQueryDefaults(['testHistory'], getCacheConfig('static'));
queryClient.setQueryDefaults(['testRuns'], getCacheConfig('realtime'));
queryClient.setQueryDefaults(['testRun'], getCacheConfig('dynamic'));
queryClient.setQueryDefaults(['health'], {
  staleTime: 30 * 1000,
  gcTime: 2 * 60 * 1000,
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {env.DEV_MODE && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

export { queryClient };
