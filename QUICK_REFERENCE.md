# Simple PW - Quick Reference

## What is this

Custom Playwright reporter with analytics and API for storing test results.

## Quick Start

### 1. Run entire project locally

```bash
# From project root
pnpm install
pnpm build

# Start API
cd packages/api
pnpm dev

# In another terminal - run tests
cd apps/demo
pnpm test
```

### 2. Integrate into your project

```bash
npm install @simple-pw/reporter
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
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

## Main Components

### 📊 Reporter (@simple-pw/reporter)

- **File**: `packages/reporter/src/reporter.ts`
- **Class**: `SimplePw`
- **Functions**: Collect test results, send to API
- **Config**: projectName, apiUrl, enabled, timeout

### 🔌 API (@simple-pw/api)

- **File**: `packages/api/src/index.ts`
- **Framework**: Fastify + Prisma + PostgreSQL
- **Endpoints**:
  - `POST /api/test-runs` - create run
  - `GET /api/test-runs` - list runs
  - `GET /api/test-runs/:id` - specific run

### 🧪 Demo (demo-app)

- **File**: `apps/demo/tests/example.spec.ts`
- **Tests**: Examples of passing, failing and skipped tests
- **Config**: `apps/demo/playwright.config.ts`

## Data Structure

### TestRun

```typescript
{
  id: string;
  projectName: string;
  branch?: string;
  commit?: string;
  timestamp: Date;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  metadata?: Record<string, unknown>;
}
```

### TestResult

```typescript
{
  id: string;
  runId: string;
  testName: string;
  fileName: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  error?: string;
  retry: number;
  screenshots?: string[];
  videos?: string[];
}
```

## Main Commands

```bash
# Build all packages
pnpm build

# Development (watch mode)
pnpm dev

# Linting
pnpm lint

# Testing
pnpm test

# Database
cd packages/api
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Apply schema to DB
pnpm db:studio    # DB UI
```

## Environment Variables

```bash
# API
DATABASE_URL="postgresql://user:pass@localhost:5432/simple_pw"
PORT=3001

# Demo tests
API_URL="http://localhost:3001"
```

## Configuration Files

- `package.json` - Workspace and dependencies
- `turbo.json` - Build configuration
- `playwright.config.ts` - Playwright settings
- `prisma/schema.prisma` - DB schema
- `tsconfig.json` - TypeScript settings

## Logs and Debugging

Reporter outputs information to console:

```
🚀 Starting test run: run_1234567890_abc12345
📊 Reporter API: http://localhost:3001
✅ Test run completed: passed
📈 Total tests: 4
📤 Sending results to http://localhost:3001
✅ Results sent successfully
```

## Useful Files for Context

1. **PROJECT_DESCRIPTION.md** - Complete project description
2. **TECHNICAL_DOCS.md** - Technical documentation
3. **README.md** - Main documentation
4. This file - **QUICK_REFERENCE.md** - Quick reference

---

_Use PROJECT_DESCRIPTION.md as main context for Simple PW prompts._
