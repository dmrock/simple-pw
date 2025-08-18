import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TestRunDetails() {
  const { id } = useParams<{ id: string }>();

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Test Run Details
          {id && <span className="text-gray-400 ml-2">#{id}</span>}
        </h1>
      </div>

      {/* Test Run Metadata */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-medium text-white">Run Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-400">Project</dt>
              <dd className="mt-1 text-sm text-white">Loading...</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Status</dt>
              <dd className="mt-1">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">
                  Loading...
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Duration</dt>
              <dd className="mt-1 text-sm text-white">-</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Date</dt>
              <dd className="mt-1 text-sm text-white">-</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-medium text-white">Test Results</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-400 text-center py-8">
            Test results will be displayed here once data is loaded.
          </p>
        </div>
      </div>
    </div>
  );
}
