# Web Dashboard API Layer

## Overview

This document describes the API layer implementation for the Simple PW web dashboard, including TypeScript types, API service, and React Query hooks.

## Structure

```
src/
├── types/
│   ├── api.ts          # Core API types and interfaces
│   └── index.ts        # Type exports
├── services/
│   ├── api.ts          # Axios-based API client
│   └── index.ts        # Service exports
├── hooks/
│   ├── useApi.ts       # React Query hooks
│   └── index.ts        # Hook exports
├── providers/
│   └── QueryProvider.tsx  # React Query provider setup
└── config/
    └── env.ts          # Environment configuration
```

## Usage Examples

### Basic API Calls

```typescript
import { ApiService } from '../services/api';

// Get paginated test runs
const testRuns = await ApiService.getTestRuns({
  page: 1,
  limit: 20,
  status: 'failed',
});

// Get specific test run
const testRun = await ApiService.getTestRun('run-id');

// Get analytics data
const analytics = await ApiService.getAnalytics({
  from: '2024-01-01',
  to: '2024-01-31',
});
```

### React Query Hooks

```typescript
import { useTestRuns, useTestRun, useAnalytics } from '../hooks/useApi';

function TestRunsList() {
  const { data, isLoading, error } = useTestRuns({
    status: 'failed',
    page: 1,
    limit: 20
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(run => (
        <div key={run.id}>{run.projectName}</div>
      ))}
    </div>
  );
}

function TestRunDetails({ runId }: { runId: string }) {
  const { data: testRun } = useTestRun(runId);
  const { data: results } = useTestResults(runId);

  return (
    <div>
      <h1>{testRun?.projectName}</h1>
      <p>Status: {testRun?.status}</p>
      <p>Duration: {testRun?.duration}ms</p>
    </div>
  );
}

function Analytics() {
  const { data } = useAnalytics({
    from: '2024-01-01',
    to: '2024-01-31'
  });

  return (
    <div>
      <p>Total Runs: {data?.totalRuns}</p>
      <p>Success Rate: {data?.successRate}%</p>
    </div>
  );
}
```

### Conditional Queries

```typescript
function ConditionalQuery({ shouldFetch, runId }: { shouldFetch: boolean, runId: string }) {
  const { data } = useTestRun(runId, { enabled: shouldFetch });

  return <div>{data?.projectName}</div>;
}
```

### Prefetching

```typescript
import { usePrefetchTestRun } from '../hooks/useApi';

function TestRunItem({ runId }: { runId: string }) {
  const prefetchTestRun = usePrefetchTestRun();

  return (
    <div
      onMouseEnter={() => prefetchTestRun(runId)}
      onClick={() => navigate(`/runs/${runId}`)}
    >
      Test Run {runId}
    </div>
  );
}
```

### Manual Refresh

```typescript
import { useRefreshTestRuns } from '../hooks/useApi';

function RefreshButton() {
  const refreshMutation = useRefreshTestRuns();

  return (
    <button
      onClick={() => refreshMutation.mutate()}
      disabled={refreshMutation.isPending}
    >
      {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
    </button>
  );
}
```

## Configuration

### Environment Variables

Create a `.env` file in the web package root:

```env
VITE_API_URL=http://localhost:8080
VITE_DEV_MODE=true
```

### Query Client Configuration

The QueryProvider is already configured with optimized defaults:

- **Stale Time**: 30 seconds for most queries
- **Cache Time**: 5-15 minutes depending on data type
- **Retry Logic**: Automatic retry for network errors, no retry for 4xx errors
- **Refetch**: Disabled on window focus, enabled on reconnect

## Error Handling

All API errors are automatically transformed into a consistent `ApiError` format:

```typescript
interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

Error types:

- `NETWORK_ERROR`: Connection issues
- `HTTP_4XX`: Client errors (no retry)
- `HTTP_5XX`: Server errors (automatic retry)
- `REQUEST_ERROR`: Other request failures

## TypeScript Types

All API responses are fully typed. Key interfaces:

- `TestRun`: Complete test run information
- `TestResult`: Individual test result details
- `PaginatedResponse<T>`: Paginated API responses
- `AnalyticsData`: Analytics and statistics
- `TestRunFilters`: Query filters and pagination
- `DateRange`: Date range selection

## Next Steps

This API layer is ready for use in components. The next task should focus on implementing the basic layout and routing structure to start building the UI components that will consume this API layer.
