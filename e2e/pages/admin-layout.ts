import { Page, Locator } from '@playwright/test';

export class AdminLayout {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly modelLinks: Locator;
  readonly settingsLink: Locator;
  readonly pageHeader: Locator;
  readonly dashboardLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('nav').first();
    this.modelLinks = this.sidebar.locator('a[href^="/admin/"]:not([href*="settings"])');
    this.settingsLink = page.getByRole('link', { name: 'Settings' });
    this.pageHeader = page.locator('h1').first();
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
  }

  async navigateToModel(modelName: string) {
    await this.sidebar.getByRole('link', { name: modelName }).click();
    await this.page.waitForURL(`**/admin/${modelName.toLowerCase()}`);
  }

  async navigateToSettings() {
    await this.settingsLink.click();
    await this.page.waitForURL('**/admin/settings');
  }

  async getActiveModel(): Promise<string | null> {
    const activeLink = await this.sidebar.locator('a[aria-current="page"]').textContent();
    return activeLink;
  }

  async getCurrentPageTitle(): Promise<string> {
    return await this.pageHeader.textContent() || '';
  }

  async getSidebarLinks(): Promise<string[]> {
    const links = await this.sidebar.locator('a').allTextContents();
    return links.filter(text => text.trim() !== '');
  }
}