export const CATEGORIES = [
  // Income
  'Salary',
  // Essential/Fixed Costs
  'Rent',
  'Health Insurance',
  'Mobile & Internet',
  'Bank Fees',
  // Daily Living
  'Groceries',
  'Dining Out',
  'Cash Withdrawal',
  // Transportation
  'Public Transport',
  'Rideshare',
  'Travel',
  // Shopping
  'Electronics',
  'Home & Furnishing',
  'Clothing',
  'Online Shopping',
  // Entertainment & Subscriptions
  'Streaming',
  'Gaming',
  'AI Tools',
  // Health & Wellness
  'Medical & Pharmacy',
  'Fitness',
  'Personal Care',
  // Other
  'Education',
  'Insurance',
  'Savings Transfer',
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
  savingsIn: number;
  savingsOut: number;
  savingsMovement: number;
  transactionCount: number;
}

export interface DailySummary {
  dayKey: string;
  day: string;
  income: number;
  outcome: number;
  savings: number;
  savingsIn: number;
  savingsOut: number;
  savingsMovement: number;
  balance: number;
  transactionCount: number;
}

export interface DayDetail {
  dayKey: string;
  income: number;
  outcome: number;
  savings: number;
  savingsIn: number;
  savingsOut: number;
  savingsMovement: number;
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
