# Budget Scanner - Server

REST API backend for the Budget Scanner application. Handles CSV parsing, transaction storage, auto-categorization, and data aggregation.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Express 4.18 | Web framework |
| TypeScript | Type safety |
| MongoDB | Database (via Mongoose 8) |
| Multer | File upload handling |
| csv-parse | CSV parsing |
| Swagger | API documentation |

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts        # MongoDB connection
│   │   ├── swagger.ts         # Swagger config
│   │   └── swaggerDocs.ts     # API documentation
│   ├── controllers/
│   │   ├── transactionController.ts  # Upload, summaries, export, delete
│   │   ├── categoryController.ts     # Category management
│   │   └── settingsController.ts     # User settings
│   ├── models/
│   │   ├── Transaction.ts     # Transaction schema (27 fields)
│   │   └── Settings.ts        # User configuration
│   ├── routes/
│   │   ├── transactionRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   └── settingsRoutes.ts
│   ├── services/
│   │   ├── csvParser.ts       # CSV parsing & processing
│   │   └── categoryService.ts # Categorization rules (190+ patterns)
│   ├── middleware/
│   │   └── upload.ts          # Multer configuration
│   └── index.ts               # Express app entry point
├── package.json
├── tsconfig.json
└── .env                       # Environment variables
```

## API Endpoints

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/upload` | Upload CSV file |
| GET | `/api/transactions` | Get paginated transactions |
| GET | `/api/transactions/summary/yearly` | Yearly overview |
| GET | `/api/transactions/summary/monthly/:year/:month` | Monthly breakdown |
| GET | `/api/transactions/summary/daily/:year/:month/:day` | Daily details |
| GET | `/api/transactions/export` | Export to CSV |
| DELETE | `/api/transactions/all` | Delete all/filtered transactions |
| DELETE | `/api/transactions/batch/:batchId` | Delete import batch |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/summary/:year/:month` | Category spending breakdown |
| GET | `/api/categories/rules` | Get categorization rules |
| PATCH | `/api/categories/transaction/:id` | Update transaction category |
| POST | `/api/categories/recategorize` | Bulk recategorize transactions |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get user settings |
| POST | `/api/settings` | Save settings |
| PATCH | `/api/settings` | Update settings |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## Database Schema

### Transaction Collection

```typescript
{
  date: Date,                    // Transaction date
  bookingText: string,           // Bank description
  currency: string,              // Default: 'CHF'
  zkbReference: string,          // Unique bank ID (deduplication key)
  debitCHF: number,              // Money out
  creditCHF: number,             // Money in
  balanceCHF: number,            // Running balance
  type: 'debit' | 'credit',
  amount: number,                // Absolute value
  yearKey: string,               // Format: "2024"
  monthKey: string,              // Format: "2024-01"
  dayKey: string,                // Format: "2024-01-15"
  importBatchId: string,         // Groups uploads for rollback
  category: Category,            // Auto-assigned category
  categoryManual: boolean,       // True if user overrode category
}
```

**Indexes:** `date`, `zkbReference`, `monthKey`, `dayKey`, `importBatchId`, `category`, compound indexes on `monthKey+type` and `dayKey+type`

## Categorization System

Rule-based pattern matching with priority system. Categories:

**Income:** Salary

**Essential:** Rent, Health Insurance, Mobile & Internet, Bank Fees

**Daily Living:** Groceries, Dining Out, Cash Withdrawal

**Transportation:** Public Transport, Rideshare, Travel

**Shopping:** Electronics, Home & Furnishing, Clothing, Online Shopping

**Entertainment:** Streaming, Gaming, AI Tools

**Health:** Medical & Pharmacy, Fitness, Personal Care

**Other:** Education, Insurance, Savings Transfer, Uncategorized

Rules are defined in `src/services/categoryService.ts` with 190+ merchant patterns.

## CSV Format

Expected ZKB bank statement format:

```
Date;Booking text;Curr;Amount details;ZKB reference;Reference number;Debit CHF;Credit CHF;Value date;Balance CHF;Payment purpose;Details
```

The parser handles Swiss number format (`1'234,50`) automatically.

## Development

### Prerequisites
- Node.js 18+
- MongoDB 7.0

### Environment Variables

Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/budgetscanner
PORT=3001
CLIENT_URL=http://localhost:5173
```

### Commands

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Server runs on `http://localhost:3001`

### API Documentation

Swagger UI available at `http://localhost:3001/api-docs`
