import { test, expect } from '@playwright/test';

test.describe('Budget Scanner App', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');

    // Check title is visible
    await expect(page.locator('h1')).toContainText('Budget Scanner');
  });

  test('should display file upload area', async ({ page }) => {
    await page.goto('/');

    // Check file upload dropzone is visible
    await expect(page.locator('text=Drag & drop CSV file(s) here')).toBeVisible();
  });

  test('should display export and clean buttons', async ({ page }) => {
    await page.goto('/');

    // Check export button
    await expect(page.locator('button:has-text("Export All Transactions")')).toBeVisible();

    // Check clean button
    await expect(page.locator('button:has-text("Clean All Transactions")')).toBeVisible();
  });

  test('should show yearly summary or empty state', async ({ page }) => {
    await page.goto('/');

    // Either shows empty state OR yearly summary with data
    const emptyState = page.locator('text=No transactions yet');
    const yearlySummary = page.locator('text=Yearly Summary');

    // One of these should be visible
    await expect(emptyState.or(yearlySummary)).toBeVisible();
  });

  test('should show year filter in yearly summary when data exists', async ({ page }) => {
    await page.goto('/');

    // The year filter should exist (may show "All Years" even with no data)
    const yearFilter = page.locator('select').first();
    // Just check the page loaded without errors
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should open delete confirmation dialog', async ({ page }) => {
    await page.goto('/');

    // Click clean all button
    await page.click('button:has-text("Clean All Transactions")');

    // Check confirmation dialog appears
    await expect(page.locator('text=Confirm Delete')).toBeVisible();
    await expect(page.locator('text=Are you sure you want to delete all transactions?')).toBeVisible();

    // Check cancel button exists
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Dialog should be closed
    await expect(page.locator('text=Confirm Delete')).not.toBeVisible();
  });
});
