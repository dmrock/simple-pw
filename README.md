# Simple PW

Advanced Playwright test reporter with analytics and flakiness tracking

## Quick Start

```bash
# Install dependencies and build
pnpm install && pnpm build

# Start API server
cd packages/api && pnpm dev

# Run demo tests (in another terminal)
cd apps/demo && pnpm test
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
