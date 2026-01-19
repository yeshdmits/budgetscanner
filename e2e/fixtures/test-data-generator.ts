import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import {
  TEST_PREFIX,
  TEST_CSV_PATH,
  TEST_YEAR,
  BOOKING_TEXTS_BY_CATEGORY,
  AMOUNT_RANGES,
  TEST_TRANSACTION_COUNT
} from '../utils/test-constants';

interface TestTransaction {
  date: Date;
  bookingText: string;
  currency: string;
  amountDetails: string;
  zkbReference: string;
  referenceNumber: string;
  debitCHF: number;
  creditCHF: number;
  valueDate: Date;
  balanceCHF: number;
  paymentPurpose: string;
  details: string;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function randomDateInYear(year: number): Date {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(timestamp);
}

function formatDateForCSV(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

function formatNumberForCSV(num: number): string {
  if (num === 0) return '';
  // Format as Swiss number: 1'234,56
  const [intPart, decPart = '00'] = num.toFixed(2).split('.');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${formatted},${decPart}`;
}

function generateReferenceNumber(): string {
  return `REF${randomInt(100000000, 999999999)}`;
}

function escapeCSVField(field: string): string {
  if (field.includes(';') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function getRandomCategory(): string {
  const categories = Object.keys(BOOKING_TEXTS_BY_CATEGORY).filter(c => c !== 'Salary');
  return randomItem(categories);
}

export function generateTestTransactions(count: number = TEST_TRANSACTION_COUNT): TestTransaction[] {
  const transactions: TestTransaction[] = [];
  const year = parseInt(TEST_YEAR);

  // Generate ~12% income (1 salary per month), ~88% expenses
  const monthlyIncomeCount = 12; // One salary per month
  const expenseCount = count - monthlyIncomeCount;

  let runningBalance = 10000; // Starting balance

  // Generate monthly salary payments
  for (let month = 0; month < 12; month++) {
    const date = new Date(year, month, randomInt(25, 28)); // Salary usually end of month
    const amount = randomAmount(AMOUNT_RANGES['Salary'].min, AMOUNT_RANGES['Salary'].max);
    runningBalance += amount;

    transactions.push({
      date,
      bookingText: randomItem(BOOKING_TEXTS_BY_CATEGORY['Salary']),
      currency: 'CHF',
      amountDetails: '',
      zkbReference: `${TEST_PREFIX}${uuidv4()}`,
      referenceNumber: generateReferenceNumber(),
      debitCHF: 0,
      creditCHF: amount,
      valueDate: date,
      balanceCHF: runningBalance,
      paymentPurpose: 'Monthly Salary',
      details: 'Test Employer AG'
    });
  }

  // Generate expense transactions
  for (let i = 0; i < expenseCount; i++) {
    const category = getRandomCategory();
    const date = randomDateInYear(year);
    const amountRange = AMOUNT_RANGES[category] || AMOUNT_RANGES['Uncategorized'];
    const amount = randomAmount(amountRange.min, amountRange.max);
    runningBalance -= amount;

    const bookingTexts = BOOKING_TEXTS_BY_CATEGORY[category] || BOOKING_TEXTS_BY_CATEGORY['Uncategorized'];

    transactions.push({
      date,
      bookingText: randomItem(bookingTexts),
      currency: 'CHF',
      amountDetails: '',
      zkbReference: `${TEST_PREFIX}${uuidv4()}`,
      referenceNumber: generateReferenceNumber(),
      debitCHF: amount,
      creditCHF: 0,
      valueDate: date,
      balanceCHF: runningBalance,
      paymentPurpose: `${category} payment`,
      details: `Test transaction for ${category}`
    });
  }

  // Sort by date descending (newest first, like real bank statements)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function transactionsToCSV(transactions: TestTransaction[]): string {
  const headers = [
    'Date',
    'Booking text',
    'Curr',
    'Amount details',
    'ZKB reference',
    'Reference number',
    'Debit CHF',
    'Credit CHF',
    'Value date',
    'Balance CHF',
    'Payment purpose',
    'Details'
  ];

  const rows = transactions.map(tx => [
    formatDateForCSV(tx.date),
    escapeCSVField(tx.bookingText),
    tx.currency,
    escapeCSVField(tx.amountDetails),
    tx.zkbReference,
    tx.referenceNumber,
    formatNumberForCSV(tx.debitCHF),
    formatNumberForCSV(tx.creditCHF),
    formatDateForCSV(tx.valueDate),
    formatNumberForCSV(tx.balanceCHF),
    escapeCSVField(tx.paymentPurpose),
    escapeCSVField(tx.details)
  ]);

  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
}

export function generateAndSaveTestCSV(count: number = TEST_TRANSACTION_COUNT): string {
  console.log(`Generating ${count} test transactions...`);
  const transactions = generateTestTransactions(count);
  const csvContent = transactionsToCSV(transactions);

  // Write with UTF-8 BOM for proper encoding in Excel
  fs.writeFileSync(TEST_CSV_PATH, '\uFEFF' + csvContent, 'utf-8');

  console.log(`Generated ${transactions.length} test transactions at ${TEST_CSV_PATH}`);

  // Calculate and log summary
  const incomeCount = transactions.filter(t => t.creditCHF > 0).length;
  const expenseCount = transactions.filter(t => t.debitCHF > 0).length;
  const totalIncome = transactions.reduce((sum, t) => sum + t.creditCHF, 0);
  const totalExpenses = transactions.reduce((sum, t) => sum + t.debitCHF, 0);

  console.log(`Summary: ${incomeCount} income transactions (CHF ${totalIncome.toFixed(2)})`);
  console.log(`         ${expenseCount} expense transactions (CHF ${totalExpenses.toFixed(2)})`);

  return TEST_CSV_PATH;
}

// If run directly
if (require.main === module) {
  generateAndSaveTestCSV();
}
