import { MongoClient, Db, Document } from 'mongodb';
import { TEST_PREFIX, MONGODB_URI, DATABASE_NAME } from './test-constants';

export class DbHelper {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    this.client = new MongoClient(MONGODB_URI);
    await this.client.connect();
    this.db = this.client.db(DATABASE_NAME);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  private ensureConnected(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  async getTestTransactionCount(): Promise<number> {
    const db = this.ensureConnected();
    return db.collection('transactions').countDocuments({
      zkbReference: { $regex: `^${TEST_PREFIX}` }
    });
  }

  async getTestTransactionCountByYear(year: string): Promise<number> {
    const db = this.ensureConnected();
    return db.collection('transactions').countDocuments({
      zkbReference: { $regex: `^${TEST_PREFIX}` },
      yearKey: year
    });
  }

  async getTestTransactionsByMonth(monthKey: string): Promise<Document[]> {
    const db = this.ensureConnected();
    return db.collection('transactions').find({
      zkbReference: { $regex: `^${TEST_PREFIX}` },
      monthKey
    }).toArray();
  }

  async getTestTransactionsByCategory(category: string): Promise<Document[]> {
    const db = this.ensureConnected();
    return db.collection('transactions').find({
      zkbReference: { $regex: `^${TEST_PREFIX}` },
      category
    }).toArray();
  }

  async cleanTestData(): Promise<number> {
    const db = this.ensureConnected();
    const result = await db.collection('transactions').deleteMany({
      zkbReference: { $regex: `^${TEST_PREFIX}` }
    });
    return result.deletedCount;
  }

  async verifyTransactionExists(zkbReference: string): Promise<boolean> {
    const db = this.ensureConnected();
    const tx = await db.collection('transactions').findOne({ zkbReference });
    return tx !== null;
  }

  async getAllTestTransactions(): Promise<Document[]> {
    const db = this.ensureConnected();
    return db.collection('transactions').find({
      zkbReference: { $regex: `^${TEST_PREFIX}` }
    }).sort({ date: -1 }).toArray();
  }

  async getMonthlyTotals(): Promise<{ monthKey: string; income: number; expenses: number }[]> {
    const db = this.ensureConnected();
    const result = await db.collection('transactions').aggregate([
      {
        $match: {
          zkbReference: { $regex: `^${TEST_PREFIX}` }
        }
      },
      {
        $group: {
          _id: '$monthKey',
          income: { $sum: '$creditCHF' },
          expenses: { $sum: '$debitCHF' }
        }
      },
      {
        $project: {
          monthKey: '$_id',
          income: 1,
          expenses: 1
        }
      },
      { $sort: { monthKey: -1 } }
    ]).toArray();

    return result.map(r => ({
      monthKey: r.monthKey,
      income: r.income,
      expenses: r.expenses
    }));
  }

  async getCategoryTotals(monthKey: string): Promise<{ category: string; total: number; count: number }[]> {
    const db = this.ensureConnected();
    const result = await db.collection('transactions').aggregate([
      {
        $match: {
          zkbReference: { $regex: `^${TEST_PREFIX}` },
          monthKey,
          type: 'debit'
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ]).toArray();

    return result.map(r => ({
      category: r.category,
      total: r.total,
      count: r.count
    }));
  }
}

// Singleton instance for easy access
let dbHelperInstance: DbHelper | null = null;

export function getDbHelper(): DbHelper {
  if (!dbHelperInstance) {
    dbHelperInstance = new DbHelper();
  }
  return dbHelperInstance;
}

export async function withDbHelper<T>(fn: (db: DbHelper) => Promise<T>): Promise<T> {
  const helper = new DbHelper();
  await helper.connect();
  try {
    return await fn(helper);
  } finally {
    await helper.disconnect();
  }
}
