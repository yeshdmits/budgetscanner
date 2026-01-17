import { parse } from 'csv-parse/sync';
import { categorizeTransaction } from './categoryService';
import { Category } from '../models/Transaction';

interface RawCSVRow {
  Date: string;
  'Booking text': string;
  Curr: string;
  'Amount details': string;
  'ZKB reference': string;
  'Reference number': string;
  'Debit CHF': string;
  'Credit CHF': string;
  'Value date': string;
  'Balance CHF': string;
  'Payment purpose': string;
  Details: string;
}

export interface ParsedTransaction {
  date: Date;
  bookingText: string;
  currency: string;
  amountDetails: string;
  zkbReference: string;
  referenceNumber: string;
  debitCHF: number;
  creditCHF: number;
  valueDate: Date | null;
  balanceCHF: number;
  paymentPurpose: string;
  details: string;
  type: 'debit' | 'credit';
  amount: number;
  yearKey: string;
  monthKey: string;
  dayKey: string;
  category: Category;
  categoryManual: boolean;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

function parseNumber(str: string): number {
  if (!str || str.trim() === '') return 0;
  const cleaned = str.replace(/[']/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function formatYearKey(date: Date): string {
  return date.getFullYear().toString();
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseCSV(buffer: Buffer): ParsedTransaction[] {
  const content = buffer.toString('utf-8').replace(/^\uFEFF/, '');

  const records: RawCSVRow[] = parse(content, {
    columns: true,
    delimiter: ';',
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true
  });

  const transactions: ParsedTransaction[] = [];

  for (const row of records) {
    const date = parseDate(row.Date);
    if (!date) continue;

    const debitCHF = parseNumber(row['Debit CHF']);
    const creditCHF = parseNumber(row['Credit CHF']);
    const isCredit = creditCHF > 0;
    const type = isCredit ? 'credit' : 'debit';
    const bookingText = row['Booking text'] || '';
    const paymentPurpose = row['Payment purpose'] || '';

    transactions.push({
      date,
      bookingText,
      currency: row.Curr || 'CHF',
      amountDetails: row['Amount details'] || '',
      zkbReference: row['ZKB reference'] || '',
      referenceNumber: row['Reference number'] || '',
      debitCHF,
      creditCHF,
      valueDate: parseDate(row['Value date']),
      balanceCHF: parseNumber(row['Balance CHF']),
      paymentPurpose,
      details: row.Details || '',
      type,
      amount: isCredit ? creditCHF : debitCHF,
      yearKey: formatYearKey(date),
      monthKey: formatMonthKey(date),
      dayKey: formatDayKey(date),
      category: categorizeTransaction(bookingText, paymentPurpose, type),
      categoryManual: false
    });
  }

  return transactions;
}
