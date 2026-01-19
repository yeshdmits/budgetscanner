import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { TEST_CSV_PATH, TEST_PREFIX, TEST_YEAR } from '../utils/test-constants';
import { withDbHelper } from '../utils/db-helper';

test.describe('Clean/Delete Functionality', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    // Upload fresh data for each test
    await homePage.uploadCSV(TEST_CSV_PATH);
  });

  test('should show confirmation dialog when clicking clean', async ({ page }) => {
    await homePage.clickClean();

    // Confirmation dialog should appear
    await expect(page.locator('text=Confirm Delete')).toBeVisible();
    await expect(page.locator('text=Are you sure')).toBeVisible();

    // Should have Cancel and Delete buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
  });

  test('should cancel delete when clicking cancel', async ({ page }) => {
    // Get initial count
    const initialRows = await homePage.getMonthRows();
    const initialCount = initialRows.length;

    await homePage.clickClean();
    await homePage.cancelDelete();

    // Dialog should be closed
    await expect(page.locator('text=Confirm Delete')).not.toBeVisible();

    // Data should still exist
    const afterRows = await homePage.getMonthRows();
    expect(afterRows.length).toBe(initialCount);

    // Verify in database
    await withDbHelper(async (db) => {
      const count = await db.getTestTransactionCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  test('should show correct message for filtered delete', async ({ page }) => {
    // Select specific year
    await homePage.selectYear(TEST_YEAR);

    await homePage.clickClean();

    // Dialog should mention the year being deleted
    const dialogText = await page.locator('.fixed.inset-0').textContent();
    expect(dialogText).toContain(TEST_YEAR);

    await homePage.cancelDelete();
  });

  test('should show correct message for delete all', async ({ page }) => {
    // Ensure "All Years" or similar is selected
    const years = await homePage.getAvailableYears();
    const allOption = years.find(y => y.toLowerCase().includes('all'));
    if (allOption) {
      await homePage.selectYear('all');
    }

    await homePage.clickClean();

    // Dialog should mention ALL transactions
    const dialogText = await page.locator('.fixed.inset-0').textContent();
    expect(dialogText?.toLowerCase()).toContain('all');

    await homePage.cancelDelete();
  });

  test('should delete only filtered year transactions', async ({ page }) => {
    // Get counts before
    let totalBefore: number = 0;
    let yearCountBefore: number = 0;

    await withDbHelper(async (db) => {
      totalBefore = await db.getTestTransactionCount();
      yearCountBefore = await db.getTestTransactionCountByYear(TEST_YEAR);
    });

    expect(totalBefore).toBeGreaterThan(0);
    expect(yearCountBefore).toBeGreaterThan(0);

    // Select year and delete
    await homePage.selectYear(TEST_YEAR);
    await homePage.clickClean();
    await homePage.confirmDelete();

    // Verify deletion in database
    await withDbHelper(async (db) => {
      const remaining = await db.getTestTransactionCount();
      const yearRemaining = await db.getTestTransactionCountByYear(TEST_YEAR);

      // Year transactions should be gone
      expect(yearRemaining).toBe(0);

      // Total should be reduced by year count
      expect(remaining).toBe(totalBefore - yearCountBefore);
    });
  });

  test('should update UI after deletion', async ({ page }) => {
    await homePage.selectYear(TEST_YEAR);

    // Verify there's data before
    expect(await homePage.hasData()).toBe(true);

    await homePage.clickClean();
    await homePage.confirmDelete();

    // Wait for UI to update
    await homePage.waitForLoadingComplete();
    await page.waitForTimeout(1000);

    // After deletion, either empty state is shown or the year has no rows
    const emptyState = page.locator('text=No transactions yet');
    const isEmptyState = await emptyState.isVisible().catch(() => false);

    if (!isEmptyState) {
      // Year might still be selectable but with no data
      const years = await homePage.getAvailableYears();
      if (years.includes(TEST_YEAR)) {
        await homePage.selectYear(TEST_YEAR);
        const rows = await homePage.getMonthRows();
        expect(rows.length).toBe(0);
      }
    }
  });

  test('should delete all transactions when no filter', async ({ page }) => {
    // Get initial count
    let initialCount: number = 0;
    await withDbHelper(async (db) => {
      initialCount = await db.getTestTransactionCount();
    });
    expect(initialCount).toBeGreaterThan(0);

    // Select "All Years"
    await homePage.selectYear('all');

    await homePage.clickClean();
    await homePage.confirmDelete();

    // Wait for deletion and UI update
    await homePage.waitForLoadingComplete();
    await page.waitForTimeout(1000);

    // Verify all gone from database
    await withDbHelper(async (db) => {
      const remaining = await db.getTestTransactionCount();
      expect(remaining).toBe(0);
    });

    // UI should show empty state
    await expect(page.locator('text=No transactions yet')).toBeVisible();
  });

  test('should show success message after deletion', async ({ page }) => {
    await homePage.selectYear(TEST_YEAR);
    await homePage.clickClean();
    await homePage.confirmDelete();

    // Success message should appear or empty state
    const successMessage = page.locator('text=/Deleted \\d+/');
    const emptyState = page.locator('text=No transactions yet');

    await expect(successMessage.or(emptyState)).toBeVisible();
  });

  test('should clean button label change based on filter', async ({ page }) => {
    // When "All Years" is selected
    const allYearsText = await homePage.cleanButton.textContent();
    expect(allYearsText?.toLowerCase()).toContain('clean');
    expect(allYearsText?.toLowerCase()).toContain('all');

    // When specific year is selected
    await homePage.selectYear(TEST_YEAR);
    const yearText = await homePage.cleanButton.textContent();
    expect(yearText?.toLowerCase()).toContain('clean');
    expect(yearText).toContain(TEST_YEAR);
  });
});
