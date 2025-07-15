import { test, expect } from '../fixtures/test';
import { AdminLayout } from '../pages/admin-layout';

test.describe('Admin Smoke Tests', () => {
  test('should load admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Check if admin page loads
    await expect(page).toHaveTitle(/Admin/);
    await expect(page.locator('h1').first()).toContainText('Dashboard');
  });

  test('should display model navigation links', async ({ page }) => {
    const adminLayout = new AdminLayout(page);
    await page.goto('/admin');
    
    // Check for model links in sidebar
    const modelLinks = await adminLayout.modelLinks.count();
    expect(modelLinks).toBeGreaterThan(0);
    
    // Should have at least User model
    await expect(adminLayout.sidebar.getByRole('link', { name: 'User' })).toBeVisible();
  });

  test('should navigate to model list page', async ({ page }) => {
    const adminLayout = new AdminLayout(page);
    await page.goto('/admin');
    
    // Navigate to User model
    await adminLayout.navigateToModel('User');
    
    // Verify we're on the User list page
    await expect(page).toHaveURL(/\/admin\/user$/);
    const pageHeader = await adminLayout.pageHeader.textContent();
    expect(pageHeader).toContain('User');
  });

  test('should navigate to settings page', async ({ page }) => {
    const adminLayout = new AdminLayout(page);
    await page.goto('/admin');
    
    // Navigate to settings
    await adminLayout.navigateToSettings();
    
    // Verify we're on the settings page
    await expect(page).toHaveURL(/\/admin\/settings$/);
    await expect(page.locator('h1').first()).toContainText('Settings');
  });
});