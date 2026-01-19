import * as path from 'path';

export const TEST_PREFIX = 'TEST-';
export const TEST_CSV_PATH = path.join(__dirname, '..', 'fixtures', 'sample-transactions.csv');
export const MONGODB_URI = 'mongodb://localhost:27017';
export const DATABASE_NAME = 'budgetscanner';

// Test year for data generation
export const TEST_YEAR = '2024';

// Number of test transactions to generate
export const TEST_TRANSACTION_COUNT = 1000;

// Expected categories in test data
export const EXPECTED_CATEGORIES = [
  'Salary',
  'Rent',
  'Groceries',
  'Dining Out',
  'Public Transport',
  'Health Insurance',
  'Streaming',
  'Online Shopping',
  'Uncategorized'
];

// Booking texts that map to specific categories (for test data generation)
export const BOOKING_TEXTS_BY_CATEGORY: Record<string, string[]> = {
  'Salary': ['LOHN', 'GEHALT', 'SALARY PAYMENT'],
  'Rent': ['MIETE', 'RENT PAYMENT', 'WOHNUNG'],
  'Groceries': ['MIGROS', 'COOP', 'ALDI', 'LIDL', 'DENNER'],
  'Dining Out': ['RESTAURANT', 'MCDONALD', 'STARBUCKS', 'CAFE'],
  'Public Transport': ['SBB', 'ZVV', 'VBZ'],
  'Health Insurance': ['SANITAS', 'CSS', 'SWICA', 'HELSANA'],
  'Streaming': ['NETFLIX', 'SPOTIFY', 'DISNEY', 'APPLE MUSIC'],
  'Online Shopping': ['AMAZON', 'ZALANDO', 'DIGITEC', 'GALAXUS'],
  'Uncategorized': ['MISC PAYMENT', 'TRANSFER', 'UNKNOWN']
};

// Amount ranges for different categories
export const AMOUNT_RANGES: Record<string, { min: number; max: number }> = {
  'Salary': { min: 5000, max: 8000 },
  'Rent': { min: 1500, max: 2500 },
  'Groceries': { min: 20, max: 200 },
  'Dining Out': { min: 15, max: 80 },
  'Public Transport': { min: 5, max: 100 },
  'Health Insurance': { min: 300, max: 500 },
  'Streaming': { min: 10, max: 30 },
  'Online Shopping': { min: 30, max: 500 },
  'Uncategorized': { min: 10, max: 100 }
};
