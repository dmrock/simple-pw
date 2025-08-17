// Core API types based on the existing database schema and API responses

export interface TestRun {
  id: string;
  projectName: string;
  branch?: string;
  commit?: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  results: TestResult[];
}

export interface TestResult {
  id: string;
  runId: string;
  testName: string;
  fileName: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  error?: string;
  retry: number;
  screenshots: string[];
  videos: string[];
  createdAt: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Filter and query types
export interface TestRunFilters {
  projectName?: string;
  status?: TestRun['status'];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'duration' | 'projectName' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Analytics types
export interface AnalyticsData {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  successRateHistory: Array<{
    date: string;
    successRate: number;
    totalTests: number;
  }>;
  slowestTests: Array<{
    testName: string;
    averageDuration: number;
    runCount: number;
  }>;
  flakyTests: Array<{
    testName: string;
    retryCount: number;
    failureRate: number;
    lastFailure: string;
  }>;
}

export interface DateRange {
  from: string;
  to: string;
}

// Test history types
export interface TestHistory {
  testName: string;
  runs: Array<{
    runId: string;
    projectName: string;
    status: TestResult['status'];
    duration: number;
    createdAt: string;
    error?: string;
  }>;
}
