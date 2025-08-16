# Simple PW Web Dashboard

Modern web interface for Simple Playwright Reporter - a comprehensive dashboard for viewing and analyzing Playwright test results.

## Technology Stack

- **React 18** with TypeScript
- **Vite** for build and development
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Zustand** for client state management
- **React Router** for routing
- **Axios** for HTTP requests
- **Recharts** for charts and visualization

## Development

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm dev
```

Application will be available at http://localhost:3000

### Build for production

```bash
pnpm build
```

### Type checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

## Configuration

Copy `.env.example` to `.env` and configure environment variables:

```bash
cp .env.example .env
```

### Environment Variables

- `VITE_API_URL` - API server URL (default: http://localhost:8080)
- `VITE_DEV_MODE` - Development mode (true/false)

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Base UI elements
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utilities
├── stores/             # Zustand stores
├── config/             # Configuration
└── App.tsx             # Main component
```

## API Integration

The web interface communicates with the Fastify API server through REST endpoints. Make sure the API server is running on port 8080 (or configure `VITE_API_URL` accordingly).
