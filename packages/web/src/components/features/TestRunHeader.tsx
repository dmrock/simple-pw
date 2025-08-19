import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, GitBranch, GitCommit, Package } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import type { TestRun } from '../../types/api';

export interface TestRunHeaderProps {
  testRun: TestRun;
}

export function TestRunHeader({ testRun }: TestRunHeaderProps) {
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const passedTests = testRun.results.filter(
    (r) => r.status === 'passed'
  ).length;
  const failedTests = testRun.results.filter(
    (r) => r.status === 'failed'
  ).length;
  const skippedTests = testRun.results.filter(
    (r) => r.status === 'skipped'
  ).length;
  const timedOutTests = testRun.results.filter(
    (r) => r.status === 'timedOut'
  ).length;
  const totalTests = testRun.results.length;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Test Run #{testRun.id}
          </h2>
          <StatusBadge status={testRun.status} size="lg" />
        </div>
      </div>

      <div className="p-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-gray-400" />
            <div>
              <dt className="text-sm font-medium text-gray-400">Project</dt>
              <dd className="mt-1 text-sm text-white font-medium">
                {testRun.projectName}
              </dd>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <dt className="text-sm font-medium text-gray-400">Duration</dt>
              <dd className="mt-1 text-sm text-white font-medium">
                {formatDuration(testRun.duration)}
              </dd>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <dt className="text-sm font-medium text-gray-400">Started</dt>
              <dd className="mt-1 text-sm text-white font-medium">
                {formatDistanceToNow(new Date(testRun.createdAt), {
                  addSuffix: true,
                })}
              </dd>
            </div>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-400">Total Tests</dt>
            <dd className="mt-1 text-sm text-white font-medium">
              {totalTests}
            </dd>
          </div>
        </div>

        {/* Git Information */}
        {(testRun.branch || testRun.commit) && (
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Git Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testRun.branch && (
                <div className="flex items-center space-x-3">
                  <GitBranch className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium text-gray-400">
                      Branch
                    </dt>
                    <dd className="text-sm text-white font-mono">
                      {testRun.branch}
                    </dd>
                  </div>
                </div>
              )}

              {testRun.commit && (
                <div className="flex items-center space-x-3">
                  <GitCommit className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium text-gray-400">
                      Commit
                    </dt>
                    <dd className="text-sm text-white font-mono">
                      {testRun.commit.substring(0, 8)}
                    </dd>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">
              {passedTests}
            </div>
            <div className="text-xs text-green-300">Passed</div>
          </div>

          <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">{failedTests}</div>
            <div className="text-xs text-red-300">Failed</div>
          </div>

          <div className="text-center p-3 bg-gray-700/50 rounded-lg border border-gray-500/30">
            <div className="text-2xl font-bold text-gray-400">
              {skippedTests}
            </div>
            <div className="text-xs text-gray-300">Skipped</div>
          </div>

          <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <div className="text-2xl font-bold text-yellow-400">
              {timedOutTests}
            </div>
            <div className="text-xs text-yellow-300">Timed Out</div>
          </div>
        </div>

        {/* Metadata */}
        {testRun.metadata && Object.keys(testRun.metadata).length > 0 && (
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Metadata</h3>
            <div className="space-y-2">
              {Object.entries(testRun.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-400">{key}:</span>
                  <span className="text-white font-mono">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
