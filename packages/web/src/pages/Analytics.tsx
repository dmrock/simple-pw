import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../hooks/useApi';
import { StatsOverview } from '../components/features/StatsOverview';
import { SuccessRateChart } from '../components/features/SuccessRateChart';
import { SlowestTestsTable } from '../components/features/SlowestTestsTable';
import { FlakyTestsTable } from '../components/features/FlakyTestsTable';
import {
  DateRangePicker,
  getDefaultDateRange,
} from '../components/features/DateRangePicker';
import type { DateRange } from '../types/api';

export function Analytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());

  const { data: analyticsData, isLoading, error } = useAnalytics(dateRange);

  const handleTestClick = (testName: string) => {
    // Navigate to test history page (future implementation)
    navigate(`/tests/${encodeURIComponent(testName)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

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
