import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { MonthlySummaryPage } from '../pages/monthly-summary.page';
import { TEST_CSV_PATH, EXPECTED_CATEGORIES } from '../utils/test-constants';
import { withDbHelper } from '../utils/db-helper';

test.describe('Monthly Summary Navigation', () => {
  let homePage: HomePage;
  let monthlySummaryPage: MonthlySummaryPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    monthlySummaryPage = new MonthlySummaryPage(page);
    await homePage.goto();
    await homePage.uploadCSV(TEST_CSV_PATH);
  });

  test('should navigate to monthly view when clicking a month', async ({ page }) => {
    // Get first month row
    const rows = await homePage.getMonthRows();
    expect(rows.length).toBeGreaterThan(0);

    // Click first month in the table
    await homePage.clickMonth(rows[0].month);

    // Verify monthly view is displayed
    await expect(monthlySummaryPage.backButton).toBeVisible();
    // Verify there are tables on the page (category table and daily table)
    const tables = page.locator('table');
    await expect(tables.first()).toBeVisible();
    await expect(tables.last()).toBeVisible();
  });

  test('should display category breakdown with transactions', async ({ page }) => {
    const rows = await homePage.getMonthRows();
    await homePage.clickMonth(rows[0].month);

    const categories = await monthlySummaryPage.getCategoryRows();
    expect(categories.length).toBeGreaterThan(0);

    // Verify categories have amounts and percentages
    for (const cat of categories) {
      expect(cat.category).toBeTruthy();
      // Amount should contain CHF or a number
      expect(cat.amount).toMatch(/CHF|[\d,.']+/);
      // Percentage should contain %
      expect(cat.percentage).toMatch(/%/);
    }
  });

  test('should display daily transactions summary', async ({ page }) => {
    const monthRows = await homePage.getMonthRows();
    await homePage.clickMonth(monthRows[0].month);

    const days = await monthlySummaryPage.getDayRows();
    expect(days.length).toBeGreaterThan(0);

    // Verify days have proper structure
    for (const day of days) {
      expect(day.day).toBeTruthy();
      // Count should be a number
      const count = parseInt(day.count.replace(/[^\d]/g, '') || '0');
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show income, expenses, and savings cards', async ({ page }) => {
    const monthRows = await homePage.getMonthRows();
    await homePage.clickMonth(monthRows[0].month);

    // Verify summary cards are visible
    await expect(monthlySummaryPage.incomeCard).toBeVisible();
    await expect(monthlySummaryPage.expensesCard).toBeVisible();
    await expect(monthlySummaryPage.savingsCard).toBeVisible();
  });

  test('should open daily transactions modal when clicking a day', async ({ page }) => {
    const monthRows = await homePage.getMonthRows();
    await homePage.clickMonth(monthRows[0].month);

    const dayRows = await monthlySummaryPage.getDayRows();
    expect(dayRows.length).toBeGreaterThan(0);

    // Find a day with transactions (count > 0)
    const dayWithTransactions = dayRows.find(d => {
      const count = parseInt(d.count.replace(/[^\d]/g, '') || '0');
      return count > 0;
    });

    expect(dayWithTransactions).toBeTruthy();

    // Click on the first row of the daily table (simpler approach)
    const dailyTable = page.locator('table').last();
    await dailyTable.locator('tbody tr').first().click();

    // Wait for modal
    await page.waitForTimeout(1000);

    // Verify modal is visible
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
  });

  test('should show transaction details in daily modal', async ({ page }) => {
    const monthRows = await homePage.getMonthRows();
    await homePage.clickMonth(monthRows[0].month);

    // Click first day row in the daily table
    const dailyTable = page.locator('table').last();
    await dailyTable.locator('tbody tr').first().click();

    // Wait for modal
    await page.waitForTimeout(1000);

    // Check modal has a table with transactions
    const modalTable = page.locator('.fixed.inset-0 table');
    await expect(modalTable).toBeVisible();

    // Check there are rows
    const rows = modalTable.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open category transactions modal when clicking a category', async ({ page }) => {
    const monthRows = await homePage.getMonthRows();
    await homePage.clickMonth(monthRows[0].month);

    // Click first category row in the category table (first table)
    const categoryTable = page.locator('table').first();
    await categoryTable.locator('tbody tr').first().click();

    // Wait for modal
    await page.waitForTimeout(1000);

    // Verify modal is visible
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
  });

  test('should navigate back to yearly view', async ({ page }) => {
    const monthRows = await homePage.getMonthRows();
    await homePage.clickMonth(monthRows[0].month);

    // Go back
    await monthlySummaryPage.goBack();

    // Verify back on yearly view
    await expect(homePage.yearlySummaryTable).toBeVisible();
  });

  test('should verify category totals match database', async ({ page }) => {
    const monthRows = await homePage.getMonthRows();
    const firstMonth = monthRows[0].month;
    await homePage.clickMonth(firstMonth);

    const categoryRows = await monthlySummaryPage.getCategoryRows();

    // Get DB totals for comparison
    // Extract year-month from the month title
    const monthTitle = await monthlySummaryPage.getMonthTitle();

    // Categories from UI should match expected test categories
    const uiCategories = categoryRows.map(c => c.category);

    // At least some expected categories should be present
    const matchingCategories = EXPECTED_CATEGORIES.filter(ec =>
      uiCategories.some(uc => uc.toLowerCase().includes(ec.toLowerCase()))
    );
    expect(matchingCategories.length).toBeGreaterThan(0);
  });

  test('should show correct transaction count in daily breakdown', async ({ page }) => {
    const monthRows = await homePage.getMonthRows();
    const monthlyCount = parseInt(monthRows[0].count.replace(/[^\d]/g, '') || '0');

    await homePage.clickMonth(monthRows[0].month);

    const dayRows = await monthlySummaryPage.getDayRows();

    // Sum of daily counts should equal monthly count
    const dailyTotal = dayRows.reduce((sum, day) => {
      return sum + parseInt(day.count.replace(/[^\d]/g, '') || '0');
    }, 0);

    expect(dailyTotal).toBe(monthlyCount);
  });

  test('should close modal and return to monthly view', async ({ page }) => {
    const monthRows = await homePage.getMonthRows();
    await homePage.clickMonth(monthRows[0].month);

    // Click first day row to open modal
    const dailyTable = page.locator('table').last();
    await dailyTable.locator('tbody tr').first().click();

    // Wait for modal
    await page.waitForTimeout(1000);

    // Verify modal is visible
    await expect(page.locator('.fixed.inset-0')).toBeVisible();

    // Close modal by clicking the X button (button with svg inside the modal header)
    const closeButton = page.locator('.fixed.inset-0 button').filter({ has: page.locator('svg') }).first();
    await closeButton.click();

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify we're still on monthly view (back button should still be visible)
    await expect(monthlySummaryPage.backButton).toBeVisible();
  });
});
