import { Page, Locator } from '@playwright/test';

export class MonthlySummaryPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly monthTitle: Locator;
  readonly incomeCard: Locator;
  readonly expensesCard: Locator;
  readonly savingsCard: Locator;
  readonly categorySection: Locator;
  readonly dailySection: Locator;
  readonly hideSavingsTransferCheckbox: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.locator('text=Back to Summary');
    this.monthTitle = page.locator('h2').first();
    this.incomeCard = page.locator('.bg-green-50').first();
    this.expensesCard = page.locator('.bg-red-50').first();
    this.savingsCard = page.locator('.bg-blue-50, .bg-orange-50').first();
    // Category section contains the category breakdown table
    this.categorySection = page.locator('h3:has-text("Category Breakdown")').locator('..');
    // Daily section is below the category section
    this.dailySection = page.locator('table').last().locator('..');
    this.hideSavingsTransferCheckbox = page.locator('input[type="checkbox"]');
    this.loadingSpinner = page.locator('.animate-spin');
  }

  async waitForLoadingComplete(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
    await this.waitForLoadingComplete();
  }

  async getMonthTitle(): Promise<string> {
    return (await this.monthTitle.textContent() || '').trim();
  }

  async getIncomeAmount(): Promise<string> {
    const text = await this.incomeCard.locator('.text-2xl, .text-xl').textContent();
    return (text || '').trim();
  }

  async getExpensesAmount(): Promise<string> {
    const text = await this.expensesCard.locator('.text-2xl, .text-xl').textContent();
    return (text || '').trim();
  }

  async getSavingsAmount(): Promise<string> {
    const text = await this.savingsCard.locator('.text-2xl, .text-xl').textContent();
    return (text || '').trim();
  }

  async getCategoryRows(): Promise<{ category: string; amount: string; percentage: string }[]> {
    // The category table is the first table on the page (inside category section)
    const categoryTable = this.page.locator('table').first();
    const rows = categoryTable.locator('tbody tr');
    const count = await rows.count();
    const result = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      result.push({
        category: (await cells.nth(0).textContent() || '').trim(),
        amount: (await cells.nth(1).textContent() || '').trim(),
        percentage: (await cells.nth(2).textContent() || '').trim()
      });
    }

    return result;
  }

  async getDayRows(): Promise<{ day: string; income: string; expenses: string; balance: string; count: string }[]> {
    // The daily table is the last table on the page
    const dailyTable = this.page.locator('table').last();
    const rows = dailyTable.locator('tbody tr');
    const count = await rows.count();
    const result = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      result.push({
        day: (await cells.nth(0).textContent() || '').trim(),
        income: (await cells.nth(1).textContent() || '').trim(),
        expenses: (await cells.nth(2).textContent() || '').trim(),
        balance: (await cells.nth(3).textContent() || '').trim(),
        count: (await cells.nth(4).textContent() || '').trim()
      });
    }

    return result;
  }

  async clickDay(dayText: string): Promise<void> {
    const dailyTable = this.page.locator('table').last();
    await dailyTable.locator(`tbody tr:has-text("${dayText}")`).first().click();
    // Wait for modal to appear
    await this.page.locator('.fixed.inset-0').waitFor({ timeout: 10000 });
    await this.waitForLoadingComplete();
  }

  async clickCategory(categoryName: string): Promise<void> {
    const categoryTable = this.page.locator('table').first();
    await categoryTable.locator(`tbody tr:has-text("${categoryName}")`).first().click();
    // Wait for modal to appear
    await this.page.locator('.fixed.inset-0').waitFor({ timeout: 10000 });
    await this.waitForLoadingComplete();
  }

  async toggleHideSavingsTransfer(): Promise<void> {
    await this.hideSavingsTransferCheckbox.click();
    await this.waitForLoadingComplete();
  }

  async closeModal(): Promise<void> {
    // The modal has an X button with lucide-react X icon
    const closeButton = this.page.locator('.fixed.inset-0 button').filter({ has: this.page.locator('svg') }).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Click backdrop (the outer div with bg-black bg-opacity-50)
      await this.page.locator('.fixed.inset-0.bg-black').click({ position: { x: 10, y: 10 }, force: true });
    }
    await this.page.waitForTimeout(500);
  }

  async getModalTransactions(): Promise<{ description: string; category: string; amount: string }[]> {
    const modal = this.page.locator('.fixed.inset-0');
    const rows = modal.locator('table tbody tr');
    const count = await rows.count();
    const result = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      result.push({
        description: (await cells.nth(0).textContent() || '').trim(),
        category: (await cells.nth(1).textContent() || '').trim(),
        amount: (await cells.nth(2).textContent() || '').trim()
      });
    }

    return result;
  }

  async getModalTitle(): Promise<string> {
    const modal = this.page.locator('.fixed.inset-0');
    const title = modal.locator('h2, h3').first();
    return (await title.textContent() || '').trim();
  }

  async isModalVisible(): Promise<boolean> {
    return await this.page.locator('.fixed.inset-0').isVisible();
  }
}
