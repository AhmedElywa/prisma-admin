import { test, expect } from '../fixtures/test';
import { AdminLayout } from '../pages/admin-layout';
import { DebugUtils } from '../helpers/debug-utils';

test.describe('Admin Smoke Tests (Debug Version)', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', err => console.error('Page error:', err));
  });

  test('should load admin dashboard', async ({ page }) => {
    await DebugUtils.navigateAndWait(page, '/admin');
    
    // Debug: Check what h1 elements exist
    await DebugUtils.debugSelector(page, 'h1');
    
    // Check if admin page loads
    await expect(page).toHaveTitle(/Admin/);
    
    // Use more specific selector for the main heading
    const mainHeading = page.locator('main').getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('Dashboard');
    
    // Take screenshot for verification
    await DebugUtils.screenshot(page, 'admin-dashboard');
  });

  test('should display model navigation links', async ({ page }) => {
    const adminLayout = new AdminLayout(page);
    await DebugUtils.navigateAndWait(page, '/admin');
    
    // Debug: Check sidebar structure
    await DebugUtils.debugSelector(page, 'nav a');
    
    // Wait for sidebar to be ready
    await expect(adminLayout.sidebar).toBeVisible();
    
    // Check for model links using role-based selector
    const userLink = adminLayout.sidebar.getByRole('link', { name: 'User' });
    await expect(userLink).toBeVisible();
    
    // Verify we have navigation links
    const navLinks = await adminLayout.sidebar.getByRole('link').all();
    console.log(`Found ${navLinks.length} navigation links`);
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test('should navigate to model list page', async ({ page }) => {
    const adminLayout = new AdminLayout(page);
    await DebugUtils.navigateAndWait(page, '/admin');
    
    // Find the User link
    const userLink = adminLayout.sidebar.getByRole('link', { name: 'User' });
    await expect(userLink).toBeVisible();
    
    // Click and wait for navigation
    console.log('Clicking User link...');
    await userLink.click();
    
    // Wait for URL change (case-insensitive)
    await page.waitForURL(/\/admin\/user/i, { timeout: 10000 });
    
    // Verify we're on the User list page
    await DebugUtils.logPageInfo(page);
    const currentUrl = page.url();
    expect(currentUrl.toLowerCase()).toContain('/admin/user');
    
    // Check page header
    const pageHeader = page.locator('main').getByRole('heading', { level: 1 });
    await expect(pageHeader).toBeVisible();
    const headerText = await pageHeader.textContent();
    console.log(`Page header text: "${headerText}"`);
  });

  test('should navigate to settings page', async ({ page }) => {
    const adminLayout = new AdminLayout(page);
    await DebugUtils.navigateAndWait(page, '/admin');
    
    // Find settings link with better selector
    const settingsLink = page.getByRole('link', { name: /settings/i });
    await expect(settingsLink).toBeVisible();
    
    // Click and wait
    console.log('Clicking Settings link...');
    await settingsLink.click();
    
    // Wait for navigation
    await page.waitForURL(/\/admin\/settings/, { timeout: 10000 });
    
    // Verify we're on the settings page
    await DebugUtils.logPageInfo(page);
    await expect(page).toHaveURL(/\/admin\/settings$/);
    
    // Check for settings content (more flexible)
    const settingsContent = page.locator('main');
    await expect(settingsContent).toContainText(/settings/i);
    
    await DebugUtils.screenshot(page, 'settings-page');
  });

  test('debug - explore page structure', async ({ page }) => {
    await DebugUtils.navigateAndWait(page, '/admin');
    
    console.log('\n=== Page Structure Debug ===');
    
    // Check all headings
    console.log('\nHeadings:');
    const headings = await page.locator('h1, h2, h3').all();
    for (const heading of headings) {
      const tag = await heading.evaluate(el => el.tagName);
      const text = await heading.textContent();
      console.log(`  <${tag}>${text}</${tag}>`);
    }
    
    // Check navigation structure
    console.log('\nNavigation Links:');
    const links = await page.locator('nav a').all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`  "${text}" -> ${href}`);
    }
    
    // Interactive pause for manual inspection
    await DebugUtils.interactiveDebug(page, 'Explore the page structure');
  });
});