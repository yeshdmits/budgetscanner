export const CATEGORIES = [
  'Food',
  'Utilities',
  'Cafe/Restaurants',
  'Steam/HoYoverse',
  'AliExpress',
  'Youtube/Spotify',
  'Clothes',
  'Swisscom',
  'Sanitas (Med)',
  'SBB',
  'Rent',
  'Interdiscount/MediaMarkt',
  'Cash (ATM)',
  'Twint',
  'Support',
  'Travel',
  'Invest',
  'Addons',
  'Uncategorized'
] as const;

export type Category = typeof CATEGORIES[number];

export interface Transaction {
  _id: string;
  date: string;
  bookingText: string;
  currency: string;
  amountDetails: string;
  zkbReference: string;
  referenceNumber: string;
  debitCHF: number;
  creditCHF: number;
  valueDate: string | null;
  balanceCHF: number;
  paymentPurpose: string;
  details: string;
  type: 'debit' | 'credit';
  amount: number;
  yearKey: string;
  monthKey: string;
  dayKey: string;
  importedAt: string;
  importBatchId: string;
  category: Category;
  categoryManual: boolean;
}

export interface MonthlySummary {
  monthKey: string;
  month: string;
  income: number;
  outcome: number;
  savings: number;
  transactionCount: number;
}

export interface DailySummary {
  dayKey: string;
  day: string;
  income: number;
  outcome: number;
  savings: number;
  balance: number;
  transactionCount: number;
}

export interface DayDetail {
  dayKey: string;
  income: number;
  outcome: number;
  savings: number;
  balance: number;
  transactions: Transaction[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    imported: number;
    skipped: number;
    batchId: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CategoryBreakdown {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface CategorySummary {
  monthKey: string;
  totalExpenses: number;
  categories: CategoryBreakdown[];
}
