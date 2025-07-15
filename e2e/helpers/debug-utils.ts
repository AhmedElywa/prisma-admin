import { expect, type Page } from '@playwright/test';

export class DebugUtils {
  /**
   * Wait for page to be fully loaded with admin content
   */
  static async waitForAdminPage(page: Page) {
    // Wait for admin layout to be visible
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  }

  /**
   * Debug selector - shows all matching elements
   */
  static async debugSelector(page: Page, selector: string) {
    const elements = await page.locator(selector).all();

    for (const element of elements) {
      const text = await element.textContent();
      const isVisible = await element.isVisible();
      console.log(`  - Text: "${text}", Visible: ${isVisible}`);
    }
  }

  /**
   * Take a screenshot with a descriptive name
   */
  static async screenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/debug-${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Log current URL and page title
   */
  static async logPageInfo(page: Page) {
    const _url = page.url();
    const _title = await page.title();
  }

  /**
   * Wait for navigation with logging
   */
  static async navigateAndWait(page: Page, url: string) {
    await page.goto(url);
    await DebugUtils.waitForAdminPage(page);
    await DebugUtils.logPageInfo(page);
  }

  /**
   * Find best selector for an element
   */
  static async findBestSelector(page: Page, text: string) {
    const selectors = [
      `text="${text}"`,
      `role=button[name="${text}"]`,
      `role=link[name="${text}"]`,
      `[aria-label="${text}"]`,
      `[title="${text}"]`,
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count === 1) {
        return selector;
      }
      if (count > 1) {
        console.log(`  Multiple matches (${count}) - be more specific`);
      }
    }
  }

  /**
   * Interactive debug mode - pauses and provides info
   */
  static async interactiveDebug(page: Page, _message = 'Debug pause') {
    await DebugUtils.logPageInfo(page);
    await page.pause();
  }
}
