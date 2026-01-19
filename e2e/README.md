# E2E Tests for BudgetScanner

End-to-end tests using Playwright to validate the BudgetScanner application.

## Prerequisites

- Node.js 18+
- Docker (for MongoDB)
- npm dependencies installed (`npm install` in root)

## Quick Start

```bash
# From project root
npm test          # Run all E2E tests
npm run test:ui   # Run with Playwright UI (for debugging)
```

## Test Structure

```
e2e/
├── fixtures/
│   └── test-data-generator.ts   # Generates 1000 test transactions
├── pages/
│   ├── home.page.ts             # Home page object (yearly summary)
│   └── monthly-summary.page.ts  # Monthly view page object
├── utils/
│   ├── db-helper.ts             # MongoDB operations
│   └── test-constants.ts        # Shared constants
├── tests/
│   ├── upload.spec.ts           # CSV upload tests
│   ├── monthly-summary.spec.ts  # Navigation and modal tests
│   ├── export.spec.ts           # Export functionality tests
│   └── cleanup.spec.ts          # Clean/delete functionality tests
├── global-setup.ts              # Pre-test setup
├── global-teardown.ts           # Post-test cleanup
└── app.spec.ts                  # Basic smoke tests
```

## Test Data

All test transactions use `TEST-{uuid}` as the zkbReference field. This allows:
- Easy identification of test data
- Isolation from production data
- Automatic cleanup after tests

The test data generator creates **1000 transactions** spanning 2024:
- ~12 income transactions (monthly salary)
- ~988 expense transactions across categories (Groceries, Dining, Transport, etc.)

## Test Suites

### Upload Tests (`upload.spec.ts`)
| Test | Description |
|------|-------------|
| Upload CSV | Upload test CSV and verify data appears |
| Sort order | Verify transactions sorted newest to oldest |
| Duplicate handling | Re-upload same file, verify duplicates skipped |
| TEST- prefix | Verify all transactions have TEST- prefix in DB |
| Transaction counts | Verify correct counts per month |
| Income/expenses | Verify income and expenses displayed |

### Monthly Summary Tests (`monthly-summary.spec.ts`)
| Test | Description |
|------|-------------|
| Navigate to month | Click month row, verify monthly view loads |
| Category breakdown | Verify categories with amounts and percentages |
| Daily summary | Verify daily transaction breakdown |
| Summary cards | Verify income/expenses/savings cards |
| Daily modal | Click day, verify transaction modal opens |
| Transaction details | Verify modal shows transaction details |
| Category modal | Click category, verify category modal opens |
| Back navigation | Verify back button returns to yearly view |
| Category totals | Cross-validate category totals |
| Transaction counts | Verify daily counts sum to monthly total |
| Close modal | Verify modal closes and returns to view |

### Export Tests (`export.spec.ts`)
| Test | Description |
|------|-------------|
| Export all | Export all transactions as CSV |
| Export filtered | Export only selected year transactions |
| CSV format | Verify proper CSV structure and headers |
| Category column | Verify category included in export |
| Button label | Verify button text changes with filter |
| Transaction count | Verify correct number of transactions exported |

### Cleanup Tests (`cleanup.spec.ts`)
| Test | Description |
|------|-------------|
| Confirmation dialog | Verify delete confirmation appears |
| Cancel delete | Cancel deletion, verify data remains |
| Filtered message | Verify dialog shows selected year |
| Delete all message | Verify dialog mentions ALL transactions |
| Delete filtered | Delete only selected year, verify in DB |
| UI update | Verify UI updates after deletion |
| Delete all | Delete all transactions, verify empty state |
| Success message | Verify success message after deletion |
| Button label | Verify button text changes with filter |

## How It Works

### Global Setup (`global-setup.ts`)
1. Starts MongoDB via `docker compose up -d`
2. Waits for MongoDB to be ready
3. Generates 1000 test transactions as CSV
4. Cleans any existing TEST- prefixed transactions

### Global Teardown (`global-teardown.ts`)
1. Deletes all TEST- prefixed transactions from DB
2. Removes generated CSV file

## Running Specific Tests

```bash
# Run a specific test file
npx playwright test e2e/tests/upload.spec.ts

# Run tests matching a pattern
npx playwright test -g "upload"

# Run with headed browser (visible)
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Generate HTML report
npx playwright test --reporter=html
npx playwright show-report
```

## Configuration

See `playwright.config.ts` in project root:
- **Workers**: 1 (sequential for data consistency)
- **Timeout**: 120s per test
- **Browser**: Chromium
- **Base URL**: http://localhost:5173
- **Web Server**: Automatically starts `npm run dev`

## Troubleshooting

### MongoDB not starting
```bash
docker compose up -d
docker compose logs mongodb
```

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check if dev server is running: `npm run dev`

### Test data issues
```bash
# Manually clean test data
docker exec -it budgetscanner-mongo mongosh budgetscanner --eval 'db.transactions.deleteMany({zkbReference: /^TEST-/})'
```

### View test artifacts
After test failures, check:
- `test-results/` - Screenshots and videos
- `playwright-report/` - HTML report
