import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useTestRun, useRealTimeData } from '../hooks';
import { TestRunHeader } from '../components/features/TestRunHeader';
import { TestResultsList } from '../components/features/TestResultsList';
import { MediaViewer } from '../components/features/MediaViewer';
import {
  LoadingSpinner,
  Button,
  ConnectionStatus,
  RealTimeIndicator,
} from '../components/ui';

export function TestRunDetails() {
  const { id } = useParams<{ id: string }>();
  const {
    data: testRun,
    isLoading,
    error,
  } = useTestRun(id!, {
    enablePolling: false, // Disabled by default for details page
  });

  const { connectionStatus, refreshData, lastUpdate } = useRealTimeData(
    'testRunDetails',
    {
      ...(id && { runId: id }),
      enablePolling: false, // Can be enabled if needed
    }
  );

  // Media viewer state
  const [mediaViewer, setMediaViewer] = useState<{
    isOpen: boolean;
    type: 'screenshot' | 'video';
    url: string;
    list: string[];
    currentIndex: number;
  }>({
    isOpen: false,
    type: 'screenshot',
    url: '',
    list: [],
    currentIndex: 0,
  });

  const handleViewMedia = (type: 'screenshot' | 'video', url: string) => {
    // Find all media of the same type from all test results
    const allMedia: string[] = [];
    testRun?.results.forEach((result) => {
      if (type === 'screenshot') {
        allMedia.push(...result.screenshots);
      } else {
        allMedia.push(...result.videos);
      }
    });

    const currentIndex = allMedia.indexOf(url);

    setMediaViewer({
      isOpen: true,
      type,
      url,
      list: allMedia,
      currentIndex: currentIndex >= 0 ? currentIndex : 0,
    });
  };

  const handleMediaNavigation = (index: number) => {
    if (index >= 0 && index < mediaViewer.list.length) {
      const newUrl = mediaViewer.list[index];
      if (newUrl) {
        setMediaViewer((prev) => ({
          ...prev,
          url: newUrl,
          currentIndex: index,
        }));
      }
    }
  };

  const closeMediaViewer = () => {
    setMediaViewer((prev) => ({ ...prev, isOpen: false }));
  };

  const handleRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" color="white" />
          <p className="mt-4 text-gray-400">Loading test run details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center space-x-4">
          <Link
            to="/runs"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Test Runs</span>
          </Link>
        </div>

        {/* Error State */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            Failed to Load Test Run
          </h2>
          <p className="text-red-300 mb-4">
            {error.message ||
              'An error occurred while loading the test run details.'}
          </p>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefresh}
            className="border-red-500/50 text-red-400 hover:bg-red-900/30"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!testRun) {
    return (
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center space-x-4">
          <Link
            to="/runs"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Test Runs</span>
          </Link>
        </div>

        {/* Not Found State */}
        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-300 mb-2">
            Test Run Not Found
          </h2>
          <p className="text-gray-400">
            The test run with ID "{id}" could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/runs"
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm sm:text-base">Back to Test Runs</span>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:block">
            <RealTimeIndicator
              isPolling={false} // Not polling by default for details page
              lastUpdate={lastUpdate}
              onRefresh={handleRefresh}
              isRefreshing={isLoading}
            />
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus
        isOnline={connectionStatus.isOnline}
        isConnected={connectionStatus.isConnected}
        lastConnected={connectionStatus.lastConnected}
        retryCount={connectionStatus.retryCount}
        onRetry={connectionStatus.retryConnection}
      />

      {/* Test Run Header */}
      <TestRunHeader testRun={testRun} />

      {/* Test Results */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white">
            Test Results
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          {testRun.results.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-400 mb-2 text-sm sm:text-base">
                No test results found
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                This test run doesn't contain any test results.
              </p>
            </div>
          ) : (
            <TestResultsList
              testResults={testRun.results}
              onViewMedia={handleViewMedia}
            />
          )}
        </div>
      </div>

      {/* Media Viewer Modal */}
      <MediaViewer
        isOpen={mediaViewer.isOpen}
        onClose={closeMediaViewer}
        mediaType={mediaViewer.type}
        mediaUrl={mediaViewer.url}
        mediaList={mediaViewer.list}
        currentIndex={mediaViewer.currentIndex}
        onNavigate={handleMediaNavigation}
      />
    </div>
  );
}
