import axios, { AxiosError, AxiosResponse } from 'axios';
import { env } from '../config/env';
import type {
  TestRun,
  TestResult,
  PaginatedResponse,
  ApiError,
  TestRunFilters,
  AnalyticsData,
  DateRange,
  TestHistory,
} from '../types/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging in dev mode
apiClient.interceptors.request.use(
  (config) => {
    if (env.DEV_MODE) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (env.DEV_MODE) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const errorData = data as Record<string, unknown>;
      apiError.message =
        (errorData?.message as string) || `HTTP ${status} Error`;
      apiError.code = (errorData?.code as string) || `HTTP_${status}`;
      apiError.details = errorData;
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'Network error - please check your connection';
      apiError.code = 'NETWORK_ERROR';
    } else {
      // Something else happened
      apiError.message = error.message || 'Request failed';
      apiError.code = 'REQUEST_ERROR';
    }

    if (env.DEV_MODE) {
      console.error('API Error:', apiError);
    }

    return Promise.reject(apiError);
  }
);

// API service class
export class ApiService {
  // Test Runs endpoints
  static async getTestRuns(
    filters: TestRunFilters = {}
  ): Promise<PaginatedResponse<TestRun>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<PaginatedResponse<TestRun>>(
      `/runs?${params}`
    );
    return response.data;
  }

  static async getTestRun(id: string): Promise<TestRun> {
    const response = await apiClient.get<TestRun>(`/runs/${id}`);
    return response.data;
  }

  // Test Results endpoints
  static async getTestResults(runId: string): Promise<TestResult[]> {
    const response = await apiClient.get<TestResult[]>(
      `/runs/${runId}/results`
    );
    return response.data;
  }

  static async getTestResult(
    runId: string,
    resultId: string
  ): Promise<TestResult> {
    const response = await apiClient.get<TestResult>(
      `/runs/${runId}/results/${resultId}`
    );
    return response.data;
  }

  // Analytics endpoints
  static async getAnalytics(dateRange?: DateRange): Promise<AnalyticsData> {
    const params = new URLSearchParams();

    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    const response = await apiClient.get<AnalyticsData>(`/analytics?${params}`);
    return response.data;
  }

  // Test History endpoints
  static async getTestHistory(
    testName: string,
    dateRange?: DateRange
  ): Promise<TestHistory> {
    const params = new URLSearchParams();
    params.append('testName', testName);

    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    const response = await apiClient.get<TestHistory>(
      `/tests/history?${params}`
    );
    return response.data;
  }

  // Health check endpoint
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get<{ status: string; timestamp: string }>(
      '/health'
    );
    return response.data;
  }
}

// Export the configured axios instance for custom requests if needed
export { apiClient };
