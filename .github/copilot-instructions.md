# Simple PW - Complete Project Context

## Project Overview

Simple PW is a full-featured custom reporter for Playwright that provides advanced analytics and test result tracking. The project is built as a monorepo using Turbo and PNPM workspace.

## Quick Start

```bash
# From project root
pnpm install && pnpm build

# Start API (in one terminal)
cd packages/api && pnpm dev

# Run tests with reporter (in another terminal)
cd apps/demo && pnpm test
```

## Architecture & Technology Stack

### Monorepo Structure

```
simple-pw/
├── packages/
│   ├── reporter/          # Main reporter package (@simple-pw/reporter)
│   ├── api/              # Backend API (@simple-pw/api)
│   ├── web/              # Frontend (planned)
│   └── shared/           # Shared types (planned)
├── apps/
│   └── demo/             # Demo application with example tests
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

## Core Components

### 1. Reporter Package (@simple-pw/reporter)

**Location**: `packages/reporter/src/`

**Main Files**:

- `reporter.ts` - Main `SimplePw` class implementing Playwright `Reporter` interface
- `types.ts` - TypeScript interfaces for data structures
- `index.ts` - Package entry point with exports

**Key Features**:

- Tracks test run lifecycle (onBegin → onTestEnd → onEnd)
- Collects detailed test information (status, duration, errors, retries)
- Supports screenshots and video recordings
- Sends batch results to API endpoint
- Configurable via options object

**Configuration**:

```typescript
interface ReporterConfig {
  apiUrl?: string; // API URL for sending results
  projectName: string; // Project name
  enabled?: boolean; // Enable/disable reporter
  timeout?: number; // HTTP request timeout
}
```

**Usage Example**:

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    [
      '@simple-pw/reporter',
      {
        projectName: 'my-project',
        apiUrl: 'http://localhost:3001',
        enabled: true,
      },
    ],
  ],
});
```

**Technical Implementation**:

- Generates unique IDs: `${prefix}_${timestamp}_${uuid}`
- Maps Playwright statuses to custom types (passed/failed/skipped/timedOut)
- Graceful error handling - tests complete even if API fails
- Batch sending all results in `onEnd()` method

### 2. API Backend (@simple-pw/api)

**Location**: `packages/api/src/`

**Main Files**:

- `index.ts` - Fastify server setup with CORS and Prisma
- `routes/test-runs.ts` - REST API endpoints with Zod validation
- `prisma/schema.prisma` - Database schema

**REST Endpoints**:

- `POST /api/test-runs` - Create test run with results (transactional)
- `GET /api/test-runs` - List runs with pagination (?page=1&limit=20)
- `GET /api/test-runs/:id` - Get specific run with all results
- `GET /health` - Health check

**Database Models**:

**TestRun**:

```typescript
{
  id: string;                    // Unique identifier
  projectName: string;           // Project name
  branch?: string;               // Git branch (optional)
  commit?: string;               // Commit hash (optional)
  timestamp: Date;               // Run start time
  status: 'passed'|'failed'|'skipped'; // Overall status
  duration: number;              // Total duration in ms
  metadata?: Record<string, unknown>; // Additional data (JSON)
}
```

**TestResult**:

```typescript
{
  id: string;                    // Unique identifier
  runId: string;                 // Foreign key to TestRun
  testName: string;              // Test title
  fileName: string;              // Test file path
  status: 'passed'|'failed'|'skipped'|'timedOut'; // Test status
  duration: number;              // Test duration in ms
  error?: string;                // Error message if failed
  retry: number;                 // Retry attempt number
  screenshots?: string[];        // Screenshot file paths
  videos?: string[];             // Video file paths
}
```

**Technical Details**:

- Fastify server with logging and CORS support
- Prisma ORM with PostgreSQL database
- Zod schemas for request validation
- Cascade delete for TestResults when TestRun is deleted
- Proper handling of nullable JSON fields with Prisma

### 3. Demo Application (demo-app)

**Location**: `apps/demo/`

**Purpose**: Demonstrates reporter integration with real test examples

**Test Examples** (`tests/example.spec.ts`):

- ✅ Successful test (playwright.dev validation)
- ❌ Intentionally failing test (wrong title expectation)
- ⏭️ Skipped test (using test.skip())
- 🐌 Slow test (httpbin.org/delay endpoint)

**Configuration** (`playwright.config.ts`):

```typescript
reporter: [
  ['list'], // Standard console reporter
  [
    '../../packages/reporter/dist/index.js', // Local built reporter
    {
      projectName: 'demo-app',
      apiUrl: process.env.API_URL || 'http://localhost:3001',
      enabled: true,
    },
  ],
];
```

## Development Workflow

### Commands

```bash
# Install all dependencies
pnpm install

# Build all packages (required before running)
pnpm build

# Development mode (watch builds)
pnpm dev

# Linting
pnpm lint

# Run demo tests
cd apps/demo && pnpm test

# Database operations
cd packages/api
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Apply schema to database
pnpm db:studio      # Open Prisma Studio UI
```

### Environment Variables

```bash
# API Configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/simple_pw"
PORT=3001

# Demo Tests
API_URL="http://localhost:3001"
```

### Project Integration

```bash
# Install in your project
npm install @simple-pw/reporter

# Add to playwright.config.ts
reporter: [
  ['@simple-pw/reporter', {
    projectName: 'your-project-name',
    apiUrl: 'https://your-api-endpoint.com',
    enabled: process.env.CI === 'true',  // Only in CI
  }],
]
```

## Key Implementation Details

### ESM Modules

- All packages use `"type": "module"` in package.json
- TypeScript imports use `.js` extensions
- Proper ESM/CJS compatibility

### Error Handling Strategy

```typescript
// Reporter never fails the test run
try {
  await this.sendResults(data);
  console.log('✅ Results sent successfully');
} catch (error) {
  console.error('❌ Failed to send results:', error);
  // Continue - don't break the test execution
}
```

### Unique ID Generation

```typescript
private generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}
// Example: "run_1704067200000_a1b2c3d4"
```

### Status Mapping

- Maps Playwright statuses to normalized set
- `interrupted` → `failed` (fallback strategy)
- Ensures consistent data format

### Batch Processing

- Collects all test results during execution
- Sends everything in one HTTP request at the end
- Transactional database save ensures data consistency

## Console Output

When reporter runs, you'll see:

```
🚀 Starting test run: run_1704067200000_a1b2c3d4
📊 Reporter API: http://localhost:3001
✅ Test run completed: passed
📈 Total tests: 4
📤 Sending results to http://localhost:3001
✅ Results sent successfully
```

## Configuration Files Reference

- **`package.json`** - Workspace configuration and dependencies
- **`turbo.json`** - Build pipeline configuration
- **`playwright.config.ts`** - Playwright and reporter settings
- **`prisma/schema.prisma`** - Database schema definition
- **`tsconfig.json`** - TypeScript compilation settings
- **`eslint.config.js`** - Code quality rules

## Development Roadmap

1. **Web Interface** - Dashboard for viewing test results with charts
2. **Shared Package** - Common types and utilities across packages
3. **Analytics Features** - Flaky test detection and performance trends
4. **Integrations** - Slack/Teams notifications, GitHub status checks
5. **CI/CD Tools** - GitHub Actions, Jenkins plugins

## Troubleshooting

### Common Issues

1. **Build fails**: Run `pnpm install` then `pnpm build` from root
2. **API connection error**: Check DATABASE_URL and ensure PostgreSQL is running
3. **Reporter not working**: Verify package is built (`packages/reporter/dist/` exists)
4. **Database errors**: Run `pnpm db:push` to apply schema changes

### Debug Mode

Set environment variable for detailed logging:

```bash
DEBUG=simple-pw:* pnpm test
```

---

**This file serves as the complete context for all Simple PW related development and prompts.**
