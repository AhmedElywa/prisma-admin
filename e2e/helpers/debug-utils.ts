import { Page, expect } from '@playwright/test';

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
    console.log(`Found ${elements.length} elements matching "${selector}"`);
    
    for (let i = 0; i < elements.length; i++) {
      const text = await elements[i].textContent();
      const isVisible = await elements[i].isVisible();
      console.log(`  [${i}]: "${text}" (visible: ${isVisible})`);
    }
  }

  /**
   * Take a screenshot with a descriptive name
   */
  static async screenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `test-results/debug-${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Log current URL and page title
   */
  static async logPageInfo(page: Page) {
    const url = page.url();
    const title = await page.title();
    console.log(`Current page: ${url}`);
    console.log(`Page title: ${title}`);
  }

  /**
   * Wait for navigation with logging
   */
  static async navigateAndWait(page: Page, url: string) {
    console.log(`Navigating to: ${url}`);
    await page.goto(url);
    await this.waitForAdminPage(page);
    await this.logPageInfo(page);
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
        console.log(`Best selector for "${text}": ${selector}`);
        return selector;
      } else if (count > 1) {
        console.log(`Selector ${selector} matches ${count} elements`);
      }
    }
    console.log(`No unique selector found for "${text}"`);
  }

  /**
   * Interactive debug mode - pauses and provides info
   */
  static async interactiveDebug(page: Page, message: string = 'Debug pause') {
    console.log(`\n🔍 ${message}`);
    await this.logPageInfo(page);
    console.log('Pausing for inspection...\n');
    await page.pause();
  }
}