import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { env } from '../config/env';

// Create a client with optimized defaults for real-time updates
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global defaults for all queries
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
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
