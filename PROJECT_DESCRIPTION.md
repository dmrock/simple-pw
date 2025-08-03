# Simple PW - Custom Playwright Reporter

## Project Overview

Simple PW is a full-featured custom reporter for Playwright that provides advanced analytics and test result tracking. The project is built as a monorepo using Turbo and PNPM workspace.

## Project Architecture

### Monorepo Structure

```
simple-pw/
├── packages/
│   ├── reporter/          # Main reporter package
│   ├── api/              # Backend API for storing results
│   ├── web/              # Frontend (planned)
│   └── shared/           # Shared types and utilities (planned)
├── apps/
│   └── demo/             # Demo application with tests
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

### Technology Stack

- **Monorepo**: Turbo + PNPM workspace
- **Language**: TypeScript (ESM modules)
- **Backend**: Fastify + Prisma + PostgreSQL
- **Testing**: Playwright
- **Build**: TypeScript compiler
- **Linting**: ESLint + Prettier

## System Components

### 1. Reporter Package (@simple-pw/reporter)

**Main file**: `packages/reporter/src/reporter.ts`

The `SimplePw` class implements the `Reporter` interface from Playwright and provides:

#### Features:

- Tracking test run start and completion
- Collecting detailed information about each test
- Support for screenshots and video recordings
- Sending results to API
- Configuration through config

#### Configuration:

```typescript
interface ReporterConfig {
  apiUrl?: string; // API URL for sending results
  projectName: string; // Project name
  enabled?: boolean; // Enable/disable reporter
  timeout?: number; // Timeout for HTTP requests
}
```

#### Lifecycle methods:

- `onBegin()` - Run initialization
- `onTestEnd()` - Handling completion of each test
- `onEnd()` - Finalization and sending results

#### Generated data:

- Unique run ID
- Test status (passed/failed/skipped/timedOut)
- Execution time
- Error information
- Paths to screenshots and videos
- Number of retries

### 2. API Backend (@simple-pw/api)

**Main file**: `packages/api/src/index.ts`

Fastify server with CORS support and Prisma ORM integration.

#### Endpoints:

**POST /api/test-runs**

- Creating a new test run with results
- Data validation via Zod schemas
- Transactional saving to database

**GET /api/test-runs**

- Getting list of runs with pagination
- Parameters: `page`, `limit`
- Sorted by time (DESC)

**GET /api/test-runs/:id**

- Getting specific run by ID
- Includes all related test results

**GET /health**

- API health check

#### Data Model (Prisma):

**TestRun**:

- `id` - Unique identifier
- `projectName` - Project name
- `branch` - Git branch (optional)
- `commit` - Commit hash (optional)
- `timestamp` - Start time
- `status` - Overall run status
- `duration` - Execution duration
- `metadata` - Additional data (JSON)

**TestResult**:

- `id` - Unique identifier
- `runId` - Link to run
- `testName` - Test name
- `fileName` - Test file path
- `status` - Test status
- `duration` - Execution time
- `error` - Error message
- `retry` - Retry number
- `screenshots` - Paths to screenshots
- `videos` - Paths to videos

### 3. Demo Application (demo-app)

**Config**: `apps/demo/playwright.config.ts`

Demo application with examples of reporter usage:

#### Tests:

- ✅ Successful test (Playwright.dev check)
- ❌ Failed test (intentional error)
- ⏭️ Skipped test
- 🐌 Slow test (with delay)

#### Reporter configuration:

```typescript
reporter: [
  ['list'], // Standard list reporter
  [
    '../../packages/reporter/dist/index.js',
    {
      projectName: 'demo-app',
      apiUrl: process.env.API_URL || 'http://localhost:3001',
      enabled: true,
    },
  ],
];
```

## Usage Workflow

### 1. Local Development:

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run API in watch mode
cd packages/api
pnpm dev

# Run tests with reporter
cd apps/demo
pnpm test
```

### 2. Project Integration:

```bash
# Install reporter
npm install @simple-pw/reporter

# Configuration in playwright.config.ts
reporter: [
  [
    '@simple-pw/reporter',
    {
      projectName: 'my-project',
      apiUrl: 'https://my-api.com',
      enabled: process.env.CI === 'true',
    },
  ],
]
```

### 3. Database:

```bash
# Generate Prisma client
cd packages/api
pnpm db:generate

# Apply migrations
pnpm db:push

# Run Prisma Studio
pnpm db:studio
```

## Implementation Features

### TypeScript ESM modules

- All packages use ESM syntax
- Import files with `.js` extension in TypeScript code
- `type: "module"` in package.json

### Error Handling

- Graceful handling of HTTP requests to API
- Data validation via Zod schemas
- Detailed console logging

### Performance

- Batch sending of results upon run completion
- Configurable timeouts for HTTP requests
- Optional reporter disabling

### Extensibility

- Modular architecture with separate packages
- Configurable parameters
- Support for metadata and custom fields

## Development Plans

1. **Web Interface** - Dashboard for viewing results
2. **Shared Package** - Common types and utilities
3. **Analytics** - Flaky test tracking
4. **Integrations** - Slack, Teams notifications
5. **CI/CD** - GitHub Actions integration

## Versioning

The project uses Changesets for version management and publishing packages to NPM registry.

---

_This file is created for use as context in all prompts related to Simple PW reporter development._
