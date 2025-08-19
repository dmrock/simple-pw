import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Image,
  Video,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import type { TestResult } from '../../types/api';

export interface TestResultItemProps {
  testResult: TestResult;
  onViewMedia?: (type: 'screenshot' | 'video', url: string) => void;
}

export function TestResultItem({
  testResult,
  onViewMedia,
}: TestResultItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    const milliseconds = duration % 1000;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    if (seconds > 0) {
      return `${seconds}.${Math.floor(milliseconds / 100)}s`;
    }
    return `${milliseconds}ms`;
  };

  const hasMedia =
    testResult.screenshots.length > 0 || testResult.videos.length > 0;
  const hasError = testResult.status === 'failed' && testResult.error;
  const hasRetries = testResult.retry > 0;

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/50">
      {/* Main Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Expand/Collapse Icon */}
          <button className="text-gray-400 hover:text-white transition-colors">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Test Name */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {testResult.testName}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {testResult.fileName}
            </div>
          </div>

          {/* Status and Indicators */}
          <div className="flex items-center space-x-3">
            {hasRetries && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <RotateCcw className="h-4 w-4" />
                <span className="text-xs">{testResult.retry}</span>
              </div>
            )}

            {hasError && <AlertCircle className="h-4 w-4 text-red-400" />}

            {hasMedia && (
              <div className="flex items-center space-x-1">
                {testResult.screenshots.length > 0 && (
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Image className="h-4 w-4" />
                    <span className="text-xs">
                      {testResult.screenshots.length}
                    </span>
                  </div>
                )}
                {testResult.videos.length > 0 && (
                  <div className="flex items-center space-x-1 text-purple-400">
                    <Video className="h-4 w-4" />
                    <span className="text-xs">{testResult.videos.length}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2 text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-xs">
                {formatDuration(testResult.duration)}
              </span>
            </div>

            <StatusBadge status={testResult.status} size="sm" />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4 space-y-4">
          {/* Error Details */}
          {hasError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Error Details
              </h4>
              <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono bg-red-900/10 p-3 rounded border border-red-500/20 overflow-x-auto">
                {testResult.error}
              </pre>
            </div>
          )}

          {/* Retry Information */}
          {hasRetries && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Information
              </h4>
              <p className="text-xs text-yellow-300">
                This test was retried {testResult.retry} time
                {testResult.retry !== 1 ? 's' : ''} before{' '}
                {testResult.status === 'passed' ? 'passing' : 'failing'}.
              </p>
            </div>
          )}

          {/* Media Files */}
          {hasMedia && (
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                Media Files
              </h4>

              <div className="space-y-3">
                {/* Screenshots */}
                {testResult.screenshots.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-blue-400 mb-2 flex items-center">
                      <Image className="h-3 w-3 mr-1" />
                      Screenshots ({testResult.screenshots.length})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {testResult.screenshots.map((screenshot, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          icon={Image}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewMedia?.('screenshot', screenshot);
                          }}
                          className="justify-start text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Screenshot {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {testResult.videos.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-purple-400 mb-2 flex items-center">
                      <Video className="h-3 w-3 mr-1" />
                      Videos ({testResult.videos.length})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {testResult.videos.map((video, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          icon={Video}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewMedia?.('video', video);
                          }}
                          className="justify-start text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Video {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Details */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Test Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Test ID:</span>
                <span className="text-white ml-2 font-mono">
                  {testResult.id}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <span className="text-white ml-2">
                  {formatDuration(testResult.duration)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">File:</span>
                <span className="text-white ml-2 font-mono">
                  {testResult.fileName}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span className="ml-2">
                  <StatusBadge status={testResult.status} size="sm" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
