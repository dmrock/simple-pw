# Simple PW

Advanced Playwright test reporter with analytics and flakiness tracking

## Quick Start

### Prerequisites

Make sure PostgreSQL is installed and running:

```bash
# Install PostgreSQL (if not already installed)
brew install postgresql@17

# Start PostgreSQL service
brew services start postgresql@17

# Create database
createdb simple_pw
```

### Setup and Run

```bash
# Install dependencies and build
pnpm install && pnpm build

# Setup database schema
cd packages/api && pnpm db:push

# Start API server
pnpm dev

# Run demo tests (in another terminal)
cd apps/demo && pnpm test
```

### Database Management

```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Start/stop PostgreSQL
brew services start postgresql@17
brew services stop postgresql@17

# Open database UI
cd packages/api && pnpm db:studio
```

## Integration

```bash
npm install @simple-pw/reporter
```

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

## Documentation

📋 **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Complete project documentation and context for development

This file contains everything you need to know about the Simple PW project:

- Architecture and components
- API endpoints and data models
- Development workflow
- Configuration examples
- Troubleshooting guide

**Note**: This file is automatically used by GitHub Copilot as context for AI assistance.

## Features

- 📊 Custom Playwright reporter with detailed analytics
- 🔌 REST API for storing and retrieving test results
- 📈 Support for screenshots, videos, and error tracking
- 🎯 Batch result processing with graceful error handling
- 🔧 Configurable and extensible architecture

## Tech Stack

- **Monorepo**: Turbo + PNPM workspace
- **Language**: TypeScript (ESM modules)
- **Backend**: Fastify + Prisma + PostgreSQL
- **Testing**: Playwright
- **Build**: TypeScript compiler

## Troubleshooting

### Database Connection Issues

If you see `Can't reach database server` error:

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if stopped
brew services start postgresql@17

# Verify database exists
psql -l | grep simple_pw

# Create database if missing
createdb simple_pw
```

### API Connection Issues

If tests fail to send results to API:

```bash
# Check if API is running
curl http://localhost:3001/health

# Start API server
cd packages/api && pnpm dev
```
