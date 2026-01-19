# Budget Scanner

Personal finance tracking application for ZKB bank statements with automatic transaction categorization and drill-down summaries.

## Features

- **CSV Upload** - Import ZKB bank statement exports via drag & drop
- **Auto-categorization** - 35 categories with 190+ merchant patterns
- **Drill-down Views** - Year → Month → Day navigation
- **Data Visualization** - Income vs expenses charts
- **Export** - Download filtered transactions as CSV
- **Category Management** - Manual override and bulk recategorization

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, TypeScript, Vite, TanStack Query, Recharts, Tailwind CSS |
| Backend | Express, TypeScript, MongoDB, Mongoose |
| Testing | Playwright |
| Deployment | Docker, Helm, Kubernetes |

## Project Structure

```
budgetscanner/
├── client/              # React frontend
├── server/              # Express API
├── e2e/                 # Playwright tests
├── helm/                # Kubernetes Helm chart
├── docker-compose.yml   # MongoDB service
├── Dockerfile           # Production image
└── package.json         # Root scripts
```

## Documentation

| Component | Description |
|-----------|-------------|
| [Client](./client/README.md) | React frontend development |
| [Server](./server/README.md) | Express API development |
| [E2E Tests](./e2e/README.md) | Playwright end-to-end testing |
| [Helm Chart](./helm/README.md) | Kubernetes deployment |

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for MongoDB)

### Local Development

```bash
# 1. Start MongoDB
npm run db:start

# 2. Install dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..

# 3. Configure environment
cat > server/.env << EOF
MONGODB_URI=mongodb://localhost:27017/budgetscanner
PORT=3001
CLIENT_URL=http://localhost:5173
EOF

# 4. Start development servers
npm run dev
```

**Access points:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api-docs

### Production Docker

```bash
# Build
npm run build
docker build -t budgetscanner .

# Run
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/budgetscanner \
  budgetscanner
```

### Kubernetes Deployment

```bash
# Install with Helm
helm install budgetscanner ./helm/budgetscanner

# Access via port-forward
kubectl port-forward svc/budgetscanner 8080:80
```

See [Helm README](./helm/README.md) for detailed configuration options.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server in dev mode |
| `npm run build` | Build both client and server |
| `npm run db:start` | Start MongoDB container |
| `npm run db:stop` | Stop MongoDB container |
| `npm test` | Run Playwright e2e tests |
| `npm run test:ui` | Run Playwright with UI |

## Testing

Run end-to-end tests with Playwright:

```bash
# Run all tests
npm test

# Run with UI for debugging
npm run test:ui

# Run specific test file
npx playwright test e2e/tests/upload.spec.ts
```

See [E2E README](./e2e/README.md) for test structure and debugging.
