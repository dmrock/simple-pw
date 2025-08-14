# Technology Stack & Build System

## Build System

- **Monorepo**: Turborepo for task orchestration and caching
- **Package Manager**: PNPM with workspace configuration
- **Module System**: ESM modules throughout the project
- **TypeScript**: Strict TypeScript configuration with build info caching

## Tech Stack

### Backend (packages/api)

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify with CORS support
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod for runtime type validation
- **Development**: tsx for hot reloading

### Reporter Package (packages/reporter)

- **Target**: Playwright test reporter
- **HTTP Client**: Axios for API communication
- **Build**: TypeScript compiler with declaration files
- **Distribution**: NPM package with peer dependency on @playwright/test

### Demo Application (apps/demo)

- **Testing Framework**: Playwright
- **Reporter Integration**: Uses workspace reporter package

## Common Commands

### Development

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Start development mode (all packages)
pnpm dev

# Lint all packages
pnpm lint

# Run tests
pnpm test
```

### API Server Specific

```bash
cd packages/api

# Start API in development mode
pnpm dev

# Database operations
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio
```

### Demo Testing

```bash
cd apps/demo

# Run Playwright tests
pnpm test

# Run tests with browser UI
pnpm test:headed

# Debug tests
pnpm test:debug
```

## Code Quality

- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with shared configuration
- **Type Checking**: Strict TypeScript across all packages
