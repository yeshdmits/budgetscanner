# Budget Scanner - Client

A personal finance tracking application for ZKB bank statements with automatic transaction categorization and drill-down summaries.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| TanStack React Query | Server state management & caching |
| TanStack React Table | Data table with sorting/filtering |
| Recharts | Data visualization |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| React Dropzone | File upload UI |

## Project Structure

```
client/
├── src/
│   ├── api/
│   │   ├── categories.ts      # Category API calls
│   │   └── transactions.ts    # Transaction CRUD & summaries
│   ├── components/
│   │   ├── BudgetChart.tsx           # Recharts bar chart
│   │   ├── CategorySummary.tsx       # Spending by category
│   │   ├── CategoryTransactionsModal.tsx
│   │   ├── DailySummary.tsx          # Daily transaction table
│   │   ├── DailyTransactionsModal.tsx
│   │   ├── FileUpload.tsx            # Drag & drop CSV upload
│   │   ├── MonthlySummary.tsx        # Monthly breakdown
│   │   ├── SortableHeader.tsx        # Table sorting controls
│   │   └── YearlySummary.tsx         # Year overview (default view)
│   ├── lib/
│   │   └── utils.ts           # formatCurrency, cn (classnames)
│   ├── types/
│   │   └── transaction.ts     # TypeScript interfaces
│   ├── App.tsx                # Main app with QueryClient
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind imports
├── vite.config.ts             # Dev proxy to backend
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Architecture

### Component Hierarchy

```
App (QueryClientProvider)
└── Dashboard
    ├── FileUpload
    │   └── POST /api/transactions/upload
    │
    ├── YearlySummary (default view)
    │   ├── BudgetChart
    │   ├── Year selector
    │   ├── Export/Delete controls
    │   └── Click month → MonthlySummary
    │
    └── MonthlySummary
        ├── DailySummary table
        ├── CategorySummary
        ├── Click day → DailyTransactionsModal
        └── Click category → CategoryTransactionsModal
```

### Data Flow

```
                    ┌─────────────────┐
                    │   User Action   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  React Query    │
                    │  (useQuery)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         Cache Hit?    Fetch API     Invalidate
              │              │         on mutation
              │              │              │
              ▼              ▼              ▼
         Return data   Update cache   Refetch queries
```

### Key Components

| Component | Description |
|-----------|-------------|
| **FileUpload** | Drag & drop zone for CSV bank statements. Shows upload progress and import results |
| **YearlySummary** | Default dashboard view. Shows monthly income/expenses with bar chart. Supports year filtering, export, and batch delete |
| **MonthlySummary** | Drill-down view for a specific month. Shows daily breakdown and category spending |
| **DailySummary** | Table of transactions for each day in a month |
| **CategorySummary** | Pie chart breakdown of spending by category |
| **BudgetChart** | Recharts bar chart comparing income vs expenses by month |

## API Integration

### Endpoints Used

**Transactions**
- `POST /api/transactions/upload` - Upload CSV file
- `GET /api/transactions/summary/yearly` - Year overview
- `GET /api/transactions/summary/monthly/:year/:month` - Month breakdown
- `GET /api/transactions/summary/daily/:year/:month/:day` - Day details
- `GET /api/transactions/export` - Export to CSV
- `DELETE /api/transactions/all` - Delete filtered transactions

**Categories**
- `GET /api/categories` - List all categories
- `GET /api/categories/summary/:year/:month` - Category spending
- `PATCH /api/categories/transaction/:id` - Update transaction category

### React Query Setup

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,  // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});
```

Query keys follow the pattern: `['yearly-summary']`, `['monthly-summary', year, month]`

## Development

### Prerequisites
- Node.js 18+

### Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to the backend.

### Configuration

**vite.config.ts** - Dev server proxy configuration for API requests:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

**tailwind.config.js** - Tailwind CSS configuration with custom theme extensions.
