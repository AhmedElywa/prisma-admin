import { Page, Locator } from '@playwright/test';

export class ModelListPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly bulkSelectAll: Locator;
  readonly bulkActionsButton: Locator;
  readonly filterButton: Locator;
  readonly importButton: Locator;
  readonly exportButton: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    // Look for links that contain "Add" followed by model name
    this.createButton = page.locator('a[href$="/new"]').first();
    this.searchInput = page.getByPlaceholder(/search/i);
    this.table = page.locator('table');
    this.tableRows = this.table.locator('tbody tr');
    this.bulkSelectAll = page.locator('th input[type="checkbox"]').first();
    this.bulkActionsButton = page.getByRole('button', { name: /bulk actions/i });
    this.filterButton = page.getByRole('button', { name: /filter/i });
    this.importButton = page.getByRole('button', { name: /import/i });
    this.exportButton = page.getByRole('button', { name: /export/i });
    this.pagination = page.locator('nav[aria-label="pagination"]');
  }

  async clickCreate() {
    await this.createButton.click();
    await this.page.waitForURL('**/new');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async selectRow(index: number) {
    await this.tableRows.nth(index).locator('input[type="checkbox"]').check();
  }

  async selectAllRows() {
    await this.bulkSelectAll.check();
  }

  async clickBulkAction(action: string) {
    await this.bulkActionsButton.click();
    await this.page.getByRole('menuitem', { name: action }).click();
  }

  async clickRowAction(rowIndex: number, action: string) {
    const row = this.tableRows.nth(rowIndex);
    await row.getByRole('button', { name: /actions/i }).click();
    await this.page.getByRole('menuitem', { name: action }).click();
  }

  async getCellContent(rowIndex: number, columnName: string): Promise<string> {
    const headers = await this.table.locator('th').allTextContents();
    const columnIndex = headers.findIndex(h => h.toLowerCase().includes(columnName.toLowerCase()));
    if (columnIndex === -1) throw new Error(`Column ${columnName} not found`);
    
    const cell = this.tableRows.nth(rowIndex).locator('td').nth(columnIndex);
    return await cell.textContent() || '';
  }

  async goToPage(pageNumber: number) {
    await this.pagination.getByRole('button', { name: pageNumber.toString() }).click();
  }

  async clickNext() {
    await this.pagination.getByRole('button', { name: /next/i }).click();
  }

  async clickPrevious() {
    await this.pagination.getByRole('button', { name: /previous/i }).click();
  }
}