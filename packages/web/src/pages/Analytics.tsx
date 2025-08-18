export function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Test Runs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
          <p className="text-sm text-gray-600 mt-1">in selected period</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Average Success Rate
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">-%</p>
          <p className="text-sm text-gray-600 mt-1">across all projects</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Average Duration
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">-s</p>
          <p className="text-sm text-gray-600 mt-1">per test run</p>
        </div>
      </div>

      {/* Success Rate Chart */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Success Rate Trend
          </h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Chart will be displayed here once data is loaded
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slowest Tests */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Slowest Tests</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Slowest tests will be displayed here once data is loaded.
            </p>
          </div>
        </div>

        {/* Flaky Tests */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Flaky Tests</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Flaky tests will be displayed here once data is loaded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
