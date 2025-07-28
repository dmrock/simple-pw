import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import axios from 'axios';
import { TestRunData, TestResultData, ReporterConfig } from './types.js';

export class SimplePw implements Reporter {
  private config: ReporterConfig;
  private runId: string;
  private testResults: TestResultData[] = [];

  constructor(options: Partial<ReporterConfig> = {}) {
    this.config = {
      enabled: true,
      timeout: 10000,
      projectName: 'default',
      ...options,
    };
    this.runId = this.generateId('run');
  }

  onBegin(_config: FullConfig, _suite: Suite): void {
    if (!this.config.enabled) return;
    
    console.log(`🚀 Starting test run: ${this.runId}`);
    console.log(`📊 Reporter API: ${this.config.apiUrl || 'disabled'}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (!this.config.enabled) return;

    const testResult: TestResultData = {
      id: this.generateId('test'),
      runId: this.runId,
      testName: test.title,
      fileName: test.location.file,
      status: this.mapTestStatus(result.status),
      duration: result.duration,
      retry: result.retry,
      screenshots: result.attachments
        .filter(a => a.name === 'screenshot')
        .map(a => a.path || ''),
      videos: result.attachments
        .filter(a => a.name === 'video')
        .map(a => a.path || ''),
    };

    if (result.error?.message) {
      testResult.error = result.error.message;
    }

    this.testResults.push(testResult);
  }

  async onEnd(result: FullResult): Promise<void> {
    if (!this.config.enabled) return;

    const runData: TestRunData = {
      id: this.runId,
      projectName: this.config.projectName,
      timestamp: new Date(),
      status: this.mapRunStatus(result.status),
      duration: Date.now() - result.startTime.getTime(),
    };

    console.log(`✅ Test run completed: ${result.status}`);
    console.log(`📈 Total tests: ${this.testResults.length}`);
    
    if (this.config.apiUrl) {
      await this.sendResults(runData);
    } else {
      console.log('📝 API URL not configured, results not sent');
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  }

  private mapTestStatus(status: string): 'passed' | 'failed' | 'skipped' | 'timedOut' {
    switch (status) {
      case 'passed':
        return 'passed';
      case 'failed':
        return 'failed';
      case 'skipped':
        return 'skipped';
      case 'timedOut':
        return 'timedOut';
      case 'interrupted':
        return 'failed'; // Map interrupted to failed
      default:
        return 'failed'; // Default fallback
    }
  }

  private mapRunStatus(status: string): 'passed' | 'failed' | 'skipped' {
    switch (status) {
      case 'passed':
        return 'passed';
      case 'failed':
        return 'failed';
      case 'interrupted':
        return 'failed'; // Map interrupted to failed
      case 'timedout':
        return 'failed'; // Map timedout to failed
      default:
        return 'failed'; // Default fallback
    }
  }

  private async sendResults(runData: TestRunData): Promise<void> {
    try {
      console.log(`📤 Sending results to ${this.config.apiUrl}`);
      
      const payload = {
        run: runData,
        results: this.testResults,
      };

      await axios.post(`${this.config.apiUrl}/api/test-runs`, payload, {
        timeout: this.config.timeout || 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Results sent successfully');
    } catch (error) {
      console.error('❌ Failed to send results:', error);
    }
  }
}