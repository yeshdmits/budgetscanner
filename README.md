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

## Project Structure

```
budgetscanner/
├── client/              # React frontend
├── server/              # Express API
├── e2e/                 # Playwright tests
├── docker-compose.yml   # MongoDB service
├── Dockerfile           # Production image
└── package.json         # Root scripts
```

## Local Development

### Prerequisites

- Node.js 18+
- Docker (for MongoDB)

### Setup

1. **Start MongoDB**
   ```bash
   npm run db:start
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Configure environment**

   Create `server/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/budgetscanner
   PORT=3001
   CLIENT_URL=http://localhost:5173
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - API Docs: http://localhost:3001/api-docs

## Production Docker Build

### Build

```bash
# Build client and server
npm run build

# Build Docker image
docker build -t budgetscanner .
```

### Run

```bash
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/budgetscanner \
  -e PORT=3001 \
  budgetscanner
```

Access the application at http://localhost:3001

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server in dev mode |
| `npm run build` | Build both client and server |
| `npm run db:start` | Start MongoDB container |
| `npm run db:stop` | Stop MongoDB container |
| `npm test` | Run Playwright e2e tests |
| `npm run test:ui` | Run Playwright with UI |
