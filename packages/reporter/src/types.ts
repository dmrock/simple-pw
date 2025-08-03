export interface TestRunData {
  id: string;
  projectName: string;
  branch?: string;
  commit?: string;
  timestamp: Date;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface TestResultData {
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
}

export interface ReporterConfig {
  apiUrl?: string;
  projectName: string;
  enabled?: boolean;
  timeout?: number;
}
