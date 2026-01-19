import { Schema, model, Document } from 'mongoose';

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
  'Savings Transfer',
  'Uncategorized'
] as const;

export type Category = typeof CATEGORIES[number];

export interface ITransaction extends Document {
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
  importedAt: Date;
  importBatchId: string;
  category: Category;
  categoryManual: boolean;
}

const transactionSchema = new Schema<ITransaction>({
  date: { type: Date, required: true, index: true },
  bookingText: { type: String, required: true },
  currency: { type: String, default: 'CHF' },
  amountDetails: { type: String, default: '' },
  zkbReference: { type: String, index: true },
  referenceNumber: { type: String, default: '' },
  debitCHF: { type: Number, default: 0 },
  creditCHF: { type: Number, default: 0 },
  valueDate: { type: Date, default: null },
  balanceCHF: { type: Number, default: 0 },
  paymentPurpose: { type: String, default: '' },
  details: { type: String, default: '' },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  amount: { type: Number, required: true },
  yearKey: { type: String, required: true, index: true },
  monthKey: { type: String, required: true, index: true },
  dayKey: { type: String, required: true, index: true },
  importedAt: { type: Date, default: Date.now },
  importBatchId: { type: String, required: true, index: true },
  category: { type: String, default: 'Uncategorized', index: true },
  categoryManual: { type: Boolean, default: false }
}, {
  timestamps: true
});

transactionSchema.index({ monthKey: 1, type: 1 });
transactionSchema.index({ dayKey: 1, type: 1 });

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
