import { Page, Locator } from '@playwright/test';

export class FilterPanel {
  readonly page: Page;
  readonly filterButton: Locator;
  readonly filterPanel: Locator;
  readonly addFilterButton: Locator;
  readonly applyButton: Locator;
  readonly clearButton: Locator;
  readonly filterGroups: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterButton = page.getByRole('button', { name: /filter/i });
    this.filterPanel = page.locator('[role="dialog"]').filter({ hasText: /filter/i });
    this.addFilterButton = page.getByRole('button', { name: /add filter/i });
    this.applyButton = page.getByRole('button', { name: /apply/i });
    this.clearButton = page.getByRole('button', { name: /clear/i });
    this.filterGroups = page.locator('.filter-group');
  }

  async open() {
    await this.filterButton.click();
    await this.filterPanel.waitFor();
  }

  async close() {
    await this.page.keyboard.press('Escape');
    await this.filterPanel.waitFor({ state: 'hidden' });
  }

  async addFilter(field: string, operator: string, value: string) {
    await this.addFilterButton.click();
    
    // Select field
    const fieldSelect = this.filterPanel.getByRole('combobox').last();
    await fieldSelect.click();
    await this.page.getByRole('option', { name: field }).click();
    
    // Select operator
    const operatorSelect = this.filterPanel.locator('select').filter({ hasText: operator });
    await operatorSelect.selectOption(operator);
    
    // Enter value
    const valueInput = this.filterPanel.locator('input[type="text"]').last();
    await valueInput.fill(value);
  }

  async addDateFilter(field: string, operator: string, date: Date) {
    await this.addFilterButton.click();
    
    // Select field
    const fieldSelect = this.filterPanel.getByRole('combobox').last();
    await fieldSelect.click();
    await this.page.getByRole('option', { name: field }).click();
    
    // Select operator
    const operatorSelect = this.filterPanel.locator('select').filter({ hasText: operator });
    await operatorSelect.selectOption(operator);
    
    // Enter date
    const dateInput = this.filterPanel.locator('input[type="date"]').last();
    const dateStr = date.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
  }

  async addBooleanFilter(field: string, value: boolean) {
    await this.addFilterButton.click();
    
    // Select field
    const fieldSelect = this.filterPanel.getByRole('combobox').last();
    await fieldSelect.click();
    await this.page.getByRole('option', { name: field }).click();
    
    // Select value
    const booleanSelect = this.filterPanel.locator('select').last();
    await booleanSelect.selectOption(value ? 'true' : 'false');
  }

  async apply() {
    await this.applyButton.click();
    await this.filterPanel.waitFor({ state: 'hidden' });
  }

  async clear() {
    await this.clearButton.click();
  }

  async removeFilter(index: number) {
    const removeButtons = this.filterPanel.locator('button[aria-label="Remove filter"]');
    await removeButtons.nth(index).click();
  }

  async getFilterCount(): Promise<number> {
    return await this.filterGroups.count();
  }

  async hasActiveFilters(): Promise<boolean> {
    const filterBadge = this.filterButton.locator('.badge');
    return await filterBadge.isVisible();
  }

  async getActiveFilterCount(): Promise<number> {
    const filterBadge = this.filterButton.locator('.badge');
    if (await filterBadge.isVisible()) {
      const text = await filterBadge.textContent();
      return parseInt(text || '0');
    }
    return 0;
  }
}