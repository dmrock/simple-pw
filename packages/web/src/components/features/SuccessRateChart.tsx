import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { AnalyticsData } from '../../types/api';

interface SuccessRateChartProps {
  data: AnalyticsData | undefined;
  isLoading: boolean;
  error: Error | null | { message: string };
}

export function SuccessRateChart({
  data,
  isLoading,
  error,
}: SuccessRateChartProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white">
            Success Rate Trend
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-700 rounded-lg animate-pulse">
            <div className="text-gray-400 text-sm">Loading chart...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white">
            Success Rate Trend
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <div className="h-48 sm:h-64 flex items-center justify-center bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">Failed to load chart data</p>
          </div>
        </div>
      </div>
    );
  }

  if (
    !data ||
    !data.successRateHistory ||
    data.successRateHistory.length === 0
  ) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-medium text-white">
            Success Rate Trend
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-700 rounded-lg">
            <p className="text-gray-400 text-sm">No chart data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.successRateHistory.map((item) => ({
    date: item.date,
    successRate: item.successRate,
    totalTests: item.totalTests,
    formattedDate: format(parseISO(item.date), 'MMM dd'),
  }));

  // Custom tooltip component
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        date: string;
        successRate: number;
        totalTests: number;
        formattedDate: string;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length && payload[0] && label) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">
            {format(parseISO(label), 'MMM dd, yyyy')}
          </p>
          <p className="text-green-400">
            Success Rate: {data.successRate.toFixed(1)}%
          </p>
          <p className="text-gray-400">Total Tests: {data.totalTests}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-700">
        <h2 className="text-base sm:text-lg font-medium text-white">
          Success Rate Trend
        </h2>
      </div>
      <div className="p-3 sm:p-6">
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="formattedDate"
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="successRate"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
