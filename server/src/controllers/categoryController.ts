import { Request, Response } from 'express';
import { Transaction, CATEGORIES } from '../models/Transaction';
import { Settings } from '../models/Settings';
import { categorizeTransaction, getAllCategories, getCategoryRules } from '../services/categoryService';

export async function getCategorySummary(req: Request, res: Response) {
  try {
    const { year, month } = req.params;
    const monthKey = `${year}-${month.padStart(2, '0')}`;

    const summary = await Transaction.aggregate([
      { $match: { monthKey, type: 'debit' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$debitCHF' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalExpenses = summary.reduce((acc, item) => acc + item.total, 0);

    const formatted = summary.map(item => ({
      category: item._id || 'Uncategorized',
      total: item.total,
      count: item.count,
      percentage: totalExpenses > 0 ? Math.round((item.total / totalExpenses) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        monthKey,
        totalExpenses,
        categories: formatted
      }
    });
  } catch (error) {
    console.error('Category summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch category summary' });
  }
}

export async function updateTransactionCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!category || !CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`
      });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { category, categoryManual: true },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, error: 'Failed to update category' });
  }
}

export async function getCategories(_req: Request, res: Response) {
  try {
    res.json({
      success: true,
      data: getAllCategories()
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
}

export async function getCategoryRulesHandler(_req: Request, res: Response) {
  try {
    res.json({
      success: true,
      data: getCategoryRules()
    });
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch category rules' });
  }
}

export async function recategorizeTransactions(_req: Request, res: Response) {
  try {
    // Fetch user settings for savings transfer detection
    const settings = await Settings.findOne({ key: 'default' });
    const userFullName = settings?.userFullName || '';

    // Only recategorize transactions that weren't manually categorized
    const transactions = await Transaction.find({ categoryManual: { $ne: true } });

    let updated = 0;
    for (const tx of transactions) {
      const newCategory = categorizeTransaction(tx.bookingText, tx.paymentPurpose, tx.type, userFullName);
      if (tx.category !== newCategory) {
        tx.category = newCategory;
        await tx.save();
        updated++;
      }
    }

    res.json({
      success: true,
      message: `Recategorized ${updated} transactions`,
      data: { updated, total: transactions.length }
    });
  } catch (error) {
    console.error('Recategorize error:', error);
    res.status(500).json({ success: false, error: 'Failed to recategorize transactions' });
  }
}
