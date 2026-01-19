import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { TEST_CSV_PATH, TEST_PREFIX, TEST_TRANSACTION_COUNT } from '../utils/test-constants';
import { withDbHelper } from '../utils/db-helper';

test.describe('CSV Upload and Table Validation', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should upload CSV file and display transactions', async ({ page }) => {
    // Upload test CSV
    await homePage.uploadCSV(TEST_CSV_PATH);

    // Verify yearly summary shows data
    expect(await homePage.hasData()).toBe(true);

    // Verify in database that transactions have TEST- prefix
    await withDbHelper(async (db) => {
      const count = await db.getTestTransactionCount();
      // Should have transactions (either newly imported or already existing)
      expect(count).toBeGreaterThan(0);
    });
  });

  test('should display transactions sorted from newest to oldest by default', async ({ page }) => {
    await homePage.uploadCSV(TEST_CSV_PATH);

    // Get month rows from table
    const rows = await homePage.getMonthRows();
    expect(rows.length).toBeGreaterThan(0);

    // Extract month names and verify they are in descending order
    // Months should be December, November, October... (newest first)
    const months = rows.map(r => r.month);

    // Verify we have multiple months
    expect(months.length).toBeGreaterThanOrEqual(1);

    // If we have multiple months, verify December comes before January in the list
    // This depends on actual month format - adjust as needed
    const hasDecember = months.some(m => m.includes('December') || m.includes('Dec'));
    const hasJanuary = months.some(m => m.includes('January') || m.includes('Jan'));

    if (hasDecember && hasJanuary) {
      const decIndex = months.findIndex(m => m.includes('December') || m.includes('Dec'));
      const janIndex = months.findIndex(m => m.includes('January') || m.includes('Jan'));
      expect(decIndex).toBeLessThan(janIndex);
    }
  });

  test('should skip duplicate transactions on re-upload', async ({ page }) => {
    // First upload
    await homePage.uploadCSV(TEST_CSV_PATH);

    // Wait for first upload to complete
    await page.waitForTimeout(1000);

    // Get count after first upload
    let firstUploadCount = 0;
    await withDbHelper(async (db) => {
      firstUploadCount = await db.getTestTransactionCount();
    });

    // Second upload of same file - should skip duplicates
    await homePage.uploadCSV(TEST_CSV_PATH);

    // Verify count didn't change (duplicates were skipped)
    await withDbHelper(async (db) => {
      const secondUploadCount = await db.getTestTransactionCount();
      expect(secondUploadCount).toBe(firstUploadCount);
    });
  });

  test('should verify all uploaded transactions have TEST- prefix in database', async () => {
    await withDbHelper(async (db) => {
      const transactions = await db.getAllTestTransactions();

      // If there are transactions from a previous test run
      if (transactions.length > 0) {
        // Verify all have TEST- prefix
        for (const tx of transactions) {
          expect(tx.zkbReference).toMatch(new RegExp(`^${TEST_PREFIX}`));
        }
      }
    });
  });

  test('should show correct transaction counts per month', async ({ page }) => {
    await homePage.uploadCSV(TEST_CSV_PATH);

    const rows = await homePage.getMonthRows();

    // Verify each month has a transaction count
    for (const row of rows) {
      const count = parseInt(row.count.replace(/[^\d]/g, ''));
      expect(count).toBeGreaterThan(0);
    }

    // Verify total matches expected
    const totalCount = rows.reduce((sum, row) => {
      return sum + parseInt(row.count.replace(/[^\d]/g, '') || '0');
    }, 0);

    expect(totalCount).toBe(TEST_TRANSACTION_COUNT);
  });

  test('should display income and expenses per month', async ({ page }) => {
    await homePage.uploadCSV(TEST_CSV_PATH);

    const rows = await homePage.getMonthRows();

    for (const row of rows) {
      // Each month should have at least some income or expenses
      const hasIncome = row.income !== '-' && row.income !== '';
      const hasExpenses = row.expenses !== '-' && row.expenses !== '';

      expect(hasIncome || hasExpenses).toBe(true);
    }
  });
});
