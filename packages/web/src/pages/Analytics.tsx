import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAnalytics, useRealTimeData } from '../hooks';
import { StatsOverview } from '../components/features/StatsOverview';
import { SuccessRateChart } from '../components/features/SuccessRateChart';
import { SlowestTestsTable } from '../components/features/SlowestTestsTable';
import { FlakyTestsTable } from '../components/features/FlakyTestsTable';
import {
  DateRangePicker,
  getDefaultDateRange,
} from '../components/features/DateRangePicker';
import { Button, ConnectionStatus, RealTimeIndicator } from '../components/ui';
import type { DateRange } from '../types/api';

export function Analytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useAnalytics(dateRange, {
    enablePolling: true,
    pollingInterval: 60000, // 1 minute for analytics
  });

  const { connectionStatus, refreshData, lastUpdate } = useRealTimeData(
    'analytics',
    {
      dateRange,
      enablePolling: true,
      pollingInterval: 60000,
    }
  );

  const handleTestClick = (testName: string) => {
    // Navigate to test history page (future implementation)
    navigate(`/tests/${encodeURIComponent(testName)}`);
  };

  const handleRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Analytics
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <RealTimeIndicator
                isPolling={connectionStatus.isConnected}
                lastUpdate={lastUpdate}
                onRefresh={handleRefresh}
                isRefreshing={isLoading}
              />
            </div>
            <div className="flex items-center gap-2">
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
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>
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

      {/* Overview Stats */}
      <StatsOverview data={analyticsData} isLoading={isLoading} error={error} />

      {/* Success Rate Chart */}
      <SuccessRateChart
        data={analyticsData}
        isLoading={isLoading}
        error={error}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Slowest Tests */}
        <SlowestTestsTable
          data={analyticsData}
          isLoading={isLoading}
          error={error}
        />

        {/* Flaky Tests */}
        <FlakyTestsTable
          data={analyticsData}
          isLoading={isLoading}
          error={error}
          onTestClick={handleTestClick}
        />
      </div>
    </div>
  );
}
