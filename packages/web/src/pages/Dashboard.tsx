export function Dashboard() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stats Cards Placeholder */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">Total Test Runs</h3>
          <p className="text-2xl font-bold text-white mt-2">-</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">Success Rate</h3>
          <p className="text-2xl font-bold text-green-400 mt-2">-%</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">Avg Duration</h3>
          <p className="text-2xl font-bold text-white mt-2">-s</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">Flaky Tests</h3>
          <p className="text-2xl font-bold text-yellow-400 mt-2">-</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-medium text-white">Recent Test Runs</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-400 text-center py-8">
            Test runs will be displayed here once data is loaded.
          </p>
        </div>
      </div>
    </div>
  );
}
