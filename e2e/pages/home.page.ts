import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly fileUploadDropzone: Locator;
  readonly fileInput: Locator;
  readonly yearlySummaryTable: Locator;
  readonly yearFilter: Locator;
  readonly exportButton: Locator;
  readonly cleanButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly emptyState: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fileUploadDropzone = page.locator('text=Drag & drop CSV file(s) here').locator('..');
    this.fileInput = page.locator('input[type="file"]');
    this.yearlySummaryTable = page.locator('table').first();
    this.yearFilter = page.locator('select').first();
    this.exportButton = page.locator('button:has-text("Export")');
    this.cleanButton = page.locator('button:has-text("Clean")');
    this.successMessage = page.locator('.bg-green-50, .text-green-700');
    this.errorMessage = page.locator('.bg-red-50, .text-red-700');
    this.emptyState = page.locator('text=No transactions yet');
    this.loadingSpinner = page.locator('.animate-spin');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoadingComplete();
  }

  async waitForLoadingComplete(): Promise<void> {
    // Wait for any loading spinners to disappear
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {
      // Spinner might not exist, that's ok
    });
    // Give a small delay for React to render
    await this.page.waitForTimeout(500);
  }

  async uploadCSV(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
    // Wait for upload to complete - look for success message
    await this.page.locator('text=/Imported \\d+/').waitFor({ timeout: 120000 });
    await this.waitForLoadingComplete();
  }

  async selectYear(year: string): Promise<void> {
    await this.yearFilter.selectOption(year);
    await this.waitForLoadingComplete();
  }

  async getAvailableYears(): Promise<string[]> {
    const options = await this.yearFilter.locator('option').allTextContents();
    return options;
  }

  async getMonthRows(): Promise<{ month: string; income: string; expenses: string; savings: string; count: string }[]> {
    const rows = this.yearlySummaryTable.locator('tbody tr');
    const count = await rows.count();
    const result = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      result.push({
        month: (await cells.nth(0).textContent() || '').trim(),
        income: (await cells.nth(1).textContent() || '').trim(),
        expenses: (await cells.nth(2).textContent() || '').trim(),
        savings: (await cells.nth(3).textContent() || '').trim(),
        count: (await cells.nth(4).textContent() || '').trim()
      });
    }

    return result;
  }

  async clickMonth(monthText: string): Promise<void> {
    await this.yearlySummaryTable.locator(`tr:has-text("${monthText}")`).click();
    await this.waitForLoadingComplete();
  }

  async clickExport(): Promise<ReturnType<Page['waitForEvent']>> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    return downloadPromise;
  }

  async clickClean(): Promise<void> {
    await this.cleanButton.click();
    // Wait for confirmation dialog
    await this.page.locator('text=Confirm Delete').waitFor();
  }

  async confirmDelete(): Promise<void> {
    await this.page.locator('button:has-text("Delete")').click();
    // Wait for deletion to complete - either success message or empty state
    await Promise.race([
      this.page.locator('text=/Deleted \\d+/').waitFor({ timeout: 60000 }),
      this.page.locator('text=No transactions yet').waitFor({ timeout: 60000 })
    ]);
    await this.waitForLoadingComplete();
  }

  async cancelDelete(): Promise<void> {
    await this.page.locator('button:has-text("Cancel")').click();
    await this.page.locator('text=Confirm Delete').waitFor({ state: 'hidden' });
  }

  async getUploadMessage(): Promise<string> {
    // The upload message is in the FileUpload component, which contains "Imported" or error text
    // It's a div with bg-green-50 or bg-red-50 that contains the import result
    const uploadResult = this.page.locator('div.bg-green-50:has-text("Imported"), div.bg-green-50:has-text("skipped"), div.bg-red-50');
    if (await uploadResult.isVisible()) {
      return (await uploadResult.textContent()) || '';
    }
    return '';
  }

  async isEmptyState(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  async hasData(): Promise<boolean> {
    const rows = await this.yearlySummaryTable.locator('tbody tr').count();
    return rows > 0;
  }
}
