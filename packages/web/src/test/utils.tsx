import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Helper to create a fresh QueryClient for tests
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Mock data generators
export const createMockTestRun = (overrides = {}) => ({
  id: 'test-run-1',
  projectName: 'test-project',
  branch: 'main',
  commit: 'abc123',
  timestamp: '2025-08-16T10:00:00Z',
  status: 'passed' as const,
  duration: 120000,
  metadata: {},
  createdAt: '2025-08-16T10:00:00Z',
  results: [],
  ...overrides,
});

export const createMockTestResult = (overrides = {}) => ({
  id: 'test-result-1',
  runId: 'test-run-1',
  testName: 'should work correctly',
  fileName: 'test.spec.ts',
  status: 'passed' as const,
  duration: 5000,
  retry: 0,
  screenshots: [],
  videos: [],
  createdAt: '2025-08-16T10:01:00Z',
  ...overrides,
});

export const createMockAnalytics = (overrides = {}) => ({
  totalRuns: 100,
  successRate: 85.5,
  averageDuration: 120000,
  successRateHistory: [],
  slowestTests: [],
  flakyTests: [],
  ...overrides,
});

// Wait for async operations to complete
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
