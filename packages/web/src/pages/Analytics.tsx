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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex items-center space-x-4">
          <RealTimeIndicator
            isPolling={connectionStatus.isConnected}
            lastUpdate={lastUpdate}
            onRefresh={handleRefresh}
            isRefreshing={isLoading}
          />
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
            Refresh
          </Button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
