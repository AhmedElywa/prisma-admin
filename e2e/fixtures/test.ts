import { test as base } from '@playwright/test';

// Extend base test with admin-specific fixtures
export const test = base.extend({
  // Auto-navigate to admin page for most tests
  adminPage: async ({ page }, use) => {
    await page.goto('/admin');
    await use(page);
  },
  
  // Fixture for authenticated tests
  authenticatedPage: async ({ page }, use) => {
    // TODO: Implement authentication logic once auth is set up
    await page.goto('/admin');
    await use(page);
  },
});

export { expect } from '@playwright/test';