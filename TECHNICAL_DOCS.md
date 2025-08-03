# Simple PW - Technical Documentation for Developers

## Detailed Codebase Description

### File Structure and Purpose

#### packages/reporter/

```
src/
├── index.ts          # Main package export
├── reporter.ts       # Main SimplePw class
└── types.ts          # TypeScript interfaces
```

**index.ts** - Package entry point:

- Exports `SimplePw` class
- Exports TypeScript types
- Contains default export for Playwright

**reporter.ts** - Main logic:

- `SimplePw` class implements Playwright `Reporter` interface
- Lifecycle methods: `onBegin`, `onTestEnd`, `onEnd`
- HTTP client based on axios for data sending
- Unique ID generation for runs and tests
- Mapping Playwright statuses to custom types

**types.ts** - Type definitions:

- `TestRunData` - test run data
- `TestResultData` - individual test data
- `ReporterConfig` - reporter configuration

#### packages/api/

```
src/
├── index.ts              # Fastify server
├── routes/
│   └── test-runs.ts      # REST API endpoints
└── types/
    └── fastify.d.ts      # Fastify type extensions

prisma/
└── schema.prisma         # Database schema
```

**index.ts** - API server:

- Creating Fastify instance with logging
- Registering CORS plugin
- Connecting Prisma client as decorator
- Registering routes
- Health check endpoint

**routes/test-runs.ts** - REST API:

- Zod schemas for incoming data validation
- POST /api/test-runs - creating run and results in transaction
- GET /api/test-runs - getting list with pagination
- GET /api/test-runs/:id - getting specific run

**schema.prisma** - Database:

- `TestRun` model with metadata and related results
- `TestResult` model with cascade deletion
- PostgreSQL as main database

#### apps/demo/

```
tests/
└── example.spec.ts       # Demo tests

playwright.config.ts      # Playwright configuration
```

**example.spec.ts** - Test examples:

- Successful test (playwright.dev)
- Failing test (intentional error)
- Skipped test
- Slow test (httpbin.org/delay)

**playwright.config.ts** - Settings:

- Using list + custom reporter
- Screenshot and trace configuration
- CI/CD environment settings

### Key Technical Decisions

#### 1. Unique Identification

```typescript
private generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}
```

- Combination of timestamp + UUID for uniqueness
- Readable prefix for debugging

#### 2. Status Mapping

```typescript
private mapTestStatus(status: string): 'passed' | 'failed' | 'skipped' | 'timedOut' {
  switch (status) {
    case 'passed': return 'passed';
    case 'failed': return 'failed';
    case 'skipped': return 'skipped';
    case 'timedOut': return 'timedOut';
    case 'interrupted': return 'failed';
    default: return 'failed';
  }
}
```

- Normalizing Playwright statuses to custom types
- Fallback strategy for unknown statuses

#### 3. Batch Result Sending

```typescript
async onEnd(result: FullResult): Promise<void> {
  const runData: TestRunData = {
    // ... creating run object
  };

  const payload = {
    run: runData,
    results: this.testResults, // All results in one request
  };

  await axios.post(`${this.config.apiUrl}/api/test-runs`, payload);
}
```

- Sending all data in one HTTP request
- Transactional database saving

#### 4. Artifact Handling

```typescript
screenshots: result.attachments
  .filter(a => a.name === 'screenshot')
  .map(a => a.path || ''),
videos: result.attachments
  .filter(a => a.name === 'video')
  .map(a => a.path || ''),
```

- Extracting file paths from Playwright attachments
- Separating artifact types

#### 5. Prisma Types and Nullable Values

```typescript
const metadata: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput =
  run.metadata ? (run.metadata as Prisma.InputJsonValue) : Prisma.DbNull;
```

- Correct handling of nullable JSON fields
- Converting undefined to null for PostgreSQL

### Patterns and Architectural Decisions

#### 1. Plugin Architecture

- Reporter as separate NPM package
- Configuration through options object
- Ability to disable without code changes

#### 2. Error Handling

```typescript
async sendResults(runData: TestRunData): Promise<void> {
  try {
    await axios.post(/* ... */);
    console.log('✅ Results sent successfully');
  } catch (error) {
    console.error('❌ Failed to send results:', error);
    // Don't throw error further - tests should complete
  }
}
```

- Graceful degradation when API is unavailable
- Detailed logging for debugging

#### 3. Configuration Flexibility

```typescript
constructor(options: Partial<ReporterConfig> = {}) {
  this.config = {
    enabled: true,
    timeout: 10000,
    projectName: 'default',
    ...options, // Override default values
  };
}
```

- Default values with override capability
- Environment variables support in demo

#### 4. TypeScript Strict Mode

- All packages use strict TypeScript
- Explicit typing of all interfaces
- ESM modules with correct imports

#### 5. Monorepo Organization

- Workspace dependencies via `workspace:*`
- Shared dev dependencies in root package.json
- Turbo for parallel building

### Deployment and CI/CD

#### Local Development:

1. `pnpm install` - install dependencies
2. `pnpm build` - build all packages
3. Start PostgreSQL (Docker/local)
4. `cd packages/api && pnpm dev` - API in watch mode
5. `cd apps/demo && pnpm test` - run tests

#### Production:

1. Build packages: `pnpm build`
2. Publish to NPM: `pnpm changeset publish`
3. Deploy API to server
4. Configure DATABASE_URL for Prisma
5. Run migrations: `pnpm db:push`

### Potential Improvements

#### 1. Retry Mechanism for HTTP Requests

```typescript
private async sendResultsWithRetry(data: any, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await this.sendResults(data);
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

#### 2. Data Compression

```typescript
import { gzip } from 'zlib';
import { promisify } from 'util';

const compress = promisify(gzip);
const compressed = await compress(JSON.stringify(payload));
```

#### 3. Streaming API for Large Data

```typescript
// Send results as tests complete
onTestEnd(test: TestCase, result: TestResult): void {
  if (this.config.streamResults) {
    this.sendSingleResult(result);
  }
}
```

#### 4. Webhook Notifications

```typescript
interface ReporterConfig {
  webhookUrl?: string;
  notifyOn?: ('failure' | 'success' | 'flaky')[];
}
```

---

_Documentation for deep understanding of Simple PW reporter architecture and code._
