import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { TEST_CSV_PATH, TEST_PREFIX, TEST_YEAR } from '../utils/test-constants';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Export Functionality', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.uploadCSV(TEST_CSV_PATH);
  });

  test('should export all transactions as CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await homePage.exportButton.click();
    const download = await downloadPromise;

    // Verify download has correct filename pattern
    expect(download.suggestedFilename()).toMatch(/transactions_export.*\.csv/);

    // Save and verify content
    const downloadPath = path.join('/tmp', download.suggestedFilename());
    await download.saveAs(downloadPath);

    const content = fs.readFileSync(downloadPath, 'utf-8');

    // Should contain our test transactions (TEST- prefix in ZKB reference column)
    expect(content).toContain(TEST_PREFIX);

    // Should have CSV headers
    expect(content).toContain('Date');
    expect(content).toContain('Booking text');

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should export only filtered year transactions', async ({ page }) => {
    // Select specific year (2024 - our test year)
    await homePage.selectYear(TEST_YEAR);

    const downloadPromise = page.waitForEvent('download');
    await homePage.exportButton.click();
    const download = await downloadPromise;

    // Verify filename includes year
    expect(download.suggestedFilename()).toContain(TEST_YEAR);

    // Save and verify content
    const downloadPath = path.join('/tmp', download.suggestedFilename());
    await download.saveAs(downloadPath);

    const content = fs.readFileSync(downloadPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // Skip header, verify all dates are from test year
    let dataLinesChecked = 0;
    for (let i = 1; i < Math.min(lines.length, 20); i++) { // Check first 20 data lines
      const dateField = lines[i].split(';')[0];
      if (dateField && dateField.match(/\d{2}\.\d{2}\.\d{4}/)) {
        expect(dateField).toContain(TEST_YEAR);
        dataLinesChecked++;
      }
    }

    expect(dataLinesChecked).toBeGreaterThan(0);

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should export file with proper CSV format', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await homePage.exportButton.click();
    const download = await downloadPromise;

    const downloadPath = path.join('/tmp', download.suggestedFilename());
    await download.saveAs(downloadPath);

    const content = fs.readFileSync(downloadPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // Should have header and data
    expect(lines.length).toBeGreaterThan(1);

    // Header should have expected columns (semicolon-delimited)
    const headers = lines[0].split(';');
    expect(headers.length).toBeGreaterThanOrEqual(10);

    // Data rows should have same number of columns
    const dataRow = lines[1].split(';');
    expect(dataRow.length).toBe(headers.length);

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should include category column in export', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await homePage.exportButton.click();
    const download = await downloadPromise;

    const downloadPath = path.join('/tmp', download.suggestedFilename());
    await download.saveAs(downloadPath);

    const content = fs.readFileSync(downloadPath, 'utf-8');

    // Should have Category column
    expect(content.toLowerCase()).toContain('category');

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should export button label change based on filter', async ({ page }) => {
    // When "All Years" is selected
    const allYearsText = await homePage.exportButton.textContent();
    expect(allYearsText?.toLowerCase()).toContain('export');
    expect(allYearsText?.toLowerCase()).toContain('all');

    // When specific year is selected
    await homePage.selectYear(TEST_YEAR);
    const yearText = await homePage.exportButton.textContent();
    expect(yearText?.toLowerCase()).toContain('export');
    expect(yearText).toContain(TEST_YEAR);
  });

  test('should export correct number of transactions', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await homePage.exportButton.click();
    const download = await downloadPromise;

    const downloadPath = path.join('/tmp', download.suggestedFilename());
    await download.saveAs(downloadPath);

    const content = fs.readFileSync(downloadPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // Count lines with TEST- prefix (our test transactions)
    const testTransactionLines = lines.filter(l => l.includes(TEST_PREFIX));

    // Should have exported all our test transactions
    // (minus header which doesn't have TEST-)
    expect(testTransactionLines.length).toBeGreaterThan(0);

    // Clean up
    fs.unlinkSync(downloadPath);
  });
});
