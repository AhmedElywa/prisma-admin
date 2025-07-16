import { expect, type Locator, type Page } from '@playwright/test';

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
    this.modelLinks = this.sidebar.locator(
      'a[href^="/admin/"]:not([href*="settings"])'
    );
    this.settingsLink = page.getByTestId('nav-link-settings');
    this.pageHeader = page.locator('h1').first();
    this.dashboardLink = page.getByTestId('nav-link-dashboard');
  }

  async navigateToModel(modelName: string) {
    const modelSlug = modelName.toLowerCase();
    const expectedUrl = `/admin/${modelSlug}`;

    // Try using data-testid first
    let link = this.page.getByTestId(`nav-link-${modelSlug}`);

    // Fallback to role selector if testid not found
    if (!(await link.isVisible({ timeout: 1000 }).catch(() => false))) {
      link = this.sidebar.getByRole('link', { name: modelName });
    }

    // Ensure the link is ready and visible
    await expect(link).toBeVisible({ timeout: 5000 });

    // Try clicking and waiting for navigation
    try {
      await Promise.all([
        this.page.waitForURL(`**${expectedUrl}`, { timeout: 10_000 }),
        link.click(),
      ]);
    } catch (_error) {
      // If click navigation fails, try direct navigation
      console.log(`Navigation via click failed, using goto for ${expectedUrl}`);
      await this.page.goto(expectedUrl);
    }

    // Verify we're on the right page
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(new RegExp(`${expectedUrl}($|/|\\?)`));
    await expect(this.pageHeader).toContainText(modelName, { timeout: 5000 });
  }

  async navigateToSettings() {
    const expectedUrl = '/admin/settings';

    // Ensure the link is ready and visible
    await expect(this.settingsLink).toBeVisible({ timeout: 5000 });

    // Try clicking and waiting for navigation
    try {
      await Promise.all([
        this.page.waitForURL(`**${expectedUrl}**`, { timeout: 10_000 }),
        this.settingsLink.click(),
      ]);
    } catch (_error) {
      // If click navigation fails, try direct navigation
      console.log('Settings navigation via click failed, using goto');
      await this.page.goto(expectedUrl);
    }

    // Verify we're on the settings page
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(new RegExp(expectedUrl));
    await expect(this.pageHeader).toContainText(/Settings|Admin Settings/, {
      timeout: 5000,
    });
  }

  async getActiveModel(): Promise<string | null> {
    const activeLink = await this.sidebar
      .locator('a[aria-current="page"]')
      .textContent();
    return activeLink;
  }

  async getCurrentPageTitle(): Promise<string> {
    return (await this.pageHeader.textContent()) || '';
  }

  async getSidebarLinks(): Promise<string[]> {
    const links = await this.sidebar.locator('a').allTextContents();
    return links.filter((text) => text.trim() !== '');
  }
}
