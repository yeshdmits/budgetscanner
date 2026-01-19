import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../models/Transaction';
import { parseCSV } from '../services/csvParser';

export async function uploadTransactions(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const parsedTransactions = await parseCSV(req.file.buffer);

    if (parsedTransactions.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid transactions found in CSV' });
    }

    const batchId = `batch_${Date.now()}_${uuidv4().slice(0, 8)}`;
    let imported = 0;
    let skipped = 0;

    for (const tx of parsedTransactions) {
      if (tx.zkbReference) {
        const existing = await Transaction.findOne({ zkbReference: tx.zkbReference });
        if (existing) {
          skipped++;
          continue;
        }
      }

      await Transaction.create({
        ...tx,
        importBatchId: batchId,
        importedAt: new Date()
      });
      imported++;
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${imported} transactions`,
      data: { imported, skipped, batchId }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to process CSV file' });
  }
}

export async function getTransactions(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 1000);
    const sortBy = (req.query.sortBy as string) || 'date';
    const order = req.query.order === 'asc' ? 1 : -1;
    const type = req.query.type as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const search = req.query.search as string;
    const monthKey = req.query.monthKey as string;

    const filter: Record<string, unknown> = {};

    if (type && (type === 'debit' || type === 'credit')) {
      filter.type = type;
    }

    if (monthKey) {
      filter.monthKey = monthKey;
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (filter.date as Record<string, Date>).$lte = new Date(endDate);
    }

    if (search) {
      filter.bookingText = { $regex: search, $options: 'i' };
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
}

export async function getYearlySummary(_req: Request, res: Response) {
  try {
    const summary = await Transaction.aggregate([
      {
        $group: {
          _id: '$monthKey',
          // Exclude 'Savings Transfer' from income/outcome
          income: {
            $sum: {
              $cond: [{ $ne: ['$category', 'Savings Transfer'] }, '$creditCHF', 0]
            }
          },
          outcome: {
            $sum: {
              $cond: [{ $ne: ['$category', 'Savings Transfer'] }, '$debitCHF', 0]
            }
          },
          // Track savings transfers separately
          savingsIn: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Savings Transfer'] }, '$creditCHF', 0]
            }
          },
          savingsOut: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Savings Transfer'] }, '$debitCHF', 0]
            }
          },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          savings: { $subtract: ['$income', '$outcome'] },
          savingsMovement: { $subtract: ['$savingsIn', '$savingsOut'] }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = summary.map(item => {
      const [year, month] = item._id.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      return {
        monthKey: item._id,
        month: monthName,
        income: item.income,
        outcome: item.outcome,
        savings: item.savings,
        savingsIn: item.savingsIn,
        savingsOut: item.savingsOut,
        savingsMovement: item.savingsMovement,
        transactionCount: item.transactionCount
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Yearly summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch yearly summary' });
  }
}

export async function getMonthlySummary(req: Request, res: Response) {
  try {
    const { year, month } = req.params;
    const monthKey = `${year}-${month.padStart(2, '0')}`;

    const summary = await Transaction.aggregate([
      { $match: { monthKey } },
      {
        $group: {
          _id: '$dayKey',
          // Exclude 'Savings Transfer' from income/outcome
          income: {
            $sum: {
              $cond: [{ $ne: ['$category', 'Savings Transfer'] }, '$creditCHF', 0]
            }
          },
          outcome: {
            $sum: {
              $cond: [{ $ne: ['$category', 'Savings Transfer'] }, '$debitCHF', 0]
            }
          },
          // Track savings transfers separately
          savingsIn: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Savings Transfer'] }, '$creditCHF', 0]
            }
          },
          savingsOut: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Savings Transfer'] }, '$debitCHF', 0]
            }
          },
          transactionCount: { $sum: 1 },
          endBalance: { $last: '$balanceCHF' }
        }
      },
      {
        $addFields: {
          savings: { $subtract: ['$income', '$outcome'] },
          savingsMovement: { $subtract: ['$savingsIn', '$savingsOut'] }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = summary.map(item => {
      const [y, m, d] = item._id.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      const dayName = date.toLocaleString('en-US', { day: 'numeric', month: 'short' });

      return {
        dayKey: item._id,
        day: dayName,
        income: item.income,
        outcome: item.outcome,
        savings: item.savings,
        savingsIn: item.savingsIn,
        savingsOut: item.savingsOut,
        savingsMovement: item.savingsMovement,
        balance: item.endBalance,
        transactionCount: item.transactionCount
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Monthly summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch monthly summary' });
  }
}

export async function getDailySummary(req: Request, res: Response) {
  try {
    const { year, month, day } = req.params;
    const dayKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    const transactions = await Transaction.find({ dayKey }).sort({ date: -1 });

    const summary = transactions.reduce(
      (acc, tx) => {
        const isSavingsTransfer = tx.category === 'Savings Transfer';
        return {
          income: acc.income + (isSavingsTransfer ? 0 : tx.creditCHF),
          outcome: acc.outcome + (isSavingsTransfer ? 0 : tx.debitCHF),
          savingsIn: acc.savingsIn + (isSavingsTransfer ? tx.creditCHF : 0),
          savingsOut: acc.savingsOut + (isSavingsTransfer ? tx.debitCHF : 0)
        };
      },
      { income: 0, outcome: 0, savingsIn: 0, savingsOut: 0 }
    );

    const lastTransaction = transactions[0];

    res.json({
      success: true,
      data: {
        dayKey,
        income: summary.income,
        outcome: summary.outcome,
        savings: summary.income - summary.outcome,
        savingsIn: summary.savingsIn,
        savingsOut: summary.savingsOut,
        savingsMovement: summary.savingsIn - summary.savingsOut,
        balance: lastTransaction?.balanceCHF || 0,
        transactions
      }
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch daily summary' });
  }
}

export async function deleteBatch(req: Request, res: Response) {
  try {
    const { batchId } = req.params;
    const result = await Transaction.deleteMany({ importBatchId: batchId });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} transactions`,
      deleted: result.deletedCount
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete batch' });
  }
}

export async function deleteAllTransactions(req: Request, res: Response) {
  try {
    const year = req.query.year as string;
    const filter: Record<string, unknown> = {};

    if (year) {
      filter.yearKey = year;
    }

    const result = await Transaction.deleteMany(filter);

    const yearMsg = year ? ` for year ${year}` : '';
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} transactions${yearMsg}`,
      deleted: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete transactions' });
  }
}

function formatDateForCSV(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatNumberForCSV(num: number): string {
  if (num === 0) return '';
  return num.toFixed(2).replace('.', ',');
}

function escapeCSVField(field: string): string {
  if (field.includes(';') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export async function exportTransactions(req: Request, res: Response) {
  try {
    const year = req.query.year as string;
    const filter: Record<string, unknown> = {};

    if (year) {
      filter.yearKey = year;
    }

    const transactions = await Transaction.find(filter).sort({ date: 1 });

    if (transactions.length === 0) {
      return res.status(404).json({ success: false, error: 'No transactions to export' });
    }

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
      'Details',
      'Category'
    ];

    const rows = transactions.map(tx => [
      formatDateForCSV(tx.date),
      escapeCSVField(tx.bookingText || ''),
      tx.currency || 'CHF',
      escapeCSVField(tx.amountDetails || ''),
      tx.zkbReference || '',
      tx.referenceNumber || '',
      formatNumberForCSV(tx.debitCHF),
      formatNumberForCSV(tx.creditCHF),
      tx.valueDate ? formatDateForCSV(tx.valueDate) : '',
      formatNumberForCSV(tx.balanceCHF),
      escapeCSVField(tx.paymentPurpose || ''),
      escapeCSVField(tx.details || ''),
      tx.category || 'Uncategorized'
    ]);

    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');

    const yearSuffix = year ? `_${year}` : '';
    const filename = `transactions_export${yearSuffix}_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, error: 'Failed to export transactions' });
  }
}
