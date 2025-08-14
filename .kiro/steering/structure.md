# Project Structure & Organization

## Monorepo Layout

```
simple-pw/
├── apps/                    # Applications
│   └── demo/               # Demo Playwright tests with reporter integration
├── packages/               # Shared packages
│   ├── api/               # Backend API server
│   ├── reporter/          # Playwright reporter package
│   ├── shared/            # Shared utilities (placeholder)
│   └── web/               # Web interface (placeholder)
├── docs/                  # Documentation
└── scripts/               # Build and utility scripts
```

## Package Structure Conventions

### API Package (packages/api)

```
packages/api/
├── src/
│   ├── api.ts             # Main API setup
│   ├── index.ts           # Entry point
│   ├── routes/            # API route handlers
│   └── types/             # TypeScript type definitions
├── prisma/
│   └── schema.prisma      # Database schema
├── dist/                  # Compiled output
└── .env                   # Environment variables
```

### Reporter Package (packages/reporter)

```
packages/reporter/
├── src/
│   ├── index.ts           # Package entry point
│   ├── reporter.ts        # Main reporter implementation
│   └── types.ts           # Type definitions
└── dist/                  # Compiled output with declarations
```

### Demo Application (apps/demo)

```
apps/demo/
├── tests/                 # Playwright test files
├── test-results/          # Test execution results
├── playwright.config.ts   # Playwright configuration
└── package.json           # Dependencies and scripts
```

## Key Configuration Files

### Root Level

- `turbo.json` - Turborepo task configuration and caching
- `pnpm-workspace.yaml` - PNPM workspace package definitions
- `tsconfig.json` - Base TypeScript configuration
- `.prettierrc` - Code formatting rules
- `eslint.config.js` - Linting configuration

### Package Level

- Each package has its own `tsconfig.json` extending the root config
- Individual `package.json` files define package-specific dependencies and scripts
- Build outputs go to `dist/` directories

## Naming Conventions

- **Packages**: Scoped under `@simple-pw/` namespace
- **Workspace References**: Use `workspace:*` for internal dependencies
- **File Structure**: Kebab-case for directories, camelCase for TypeScript files
- **Database**: Snake_case table names with Prisma model mapping

## Development Workflow

- All packages build to `dist/` directories
- Turborepo handles build dependencies and caching
- TypeScript build info files (`.tsbuildinfo`) are preserved for incremental builds
- Environment variables are managed per package with `.env` files
