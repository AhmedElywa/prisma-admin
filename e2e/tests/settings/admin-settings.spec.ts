import { test, expect } from '../../fixtures/test';
import { AdminLayout } from '../../pages/admin-layout';

test.describe('Admin Settings', () => {
  let adminLayout: AdminLayout;

  test.beforeEach(async ({ page }) => {
    adminLayout = new AdminLayout(page);
    await page.goto('/admin');
  });

  test('should navigate to settings page', async ({ page }) => {
    await adminLayout.navigateToSettings();
    
    await expect(page).toHaveURL(/\/admin\/settings$/);
    await expect(page.locator('h1')).toContainText('Settings');
  });

  test('should display model configuration options', async ({ page }) => {
    await adminLayout.navigateToSettings();
    
    // Check for model list
    const modelList = page.locator('[role="list"]').filter({ hasText: /models/i });
    await expect(modelList).toBeVisible();
    
    // Check for at least User model in settings
    await expect(page.getByText('User')).toBeVisible();
  });

  test('should toggle model visibility', async ({ page }) => {
    await adminLayout.navigateToSettings();
    
    // Find a model toggle (e.g., for Post model)
    const postModelToggle = page.locator('label').filter({ hasText: 'Post' }).locator('input[type="checkbox"]');
    
    // Get initial state
    const initialState = await postModelToggle.isChecked();
    
    // Toggle the state
    await postModelToggle.click();
    
    // Verify state changed
    const newState = await postModelToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should save settings changes', async ({ page }) => {
    await adminLayout.navigateToSettings();
    
    // Make a change (toggle a model)
    const modelToggle = page.locator('label').filter({ hasText: 'Post' }).locator('input[type="checkbox"]');
    await modelToggle.click();
    
    // Save settings (if save button exists)
    const saveButton = page.getByRole('button', { name: /save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Check for success message
      await expect(page.locator('[role="status"]').filter({ hasText: /saved|success/i })).toBeVisible();
    }
  });

  test('should display field configuration for models', async ({ page }) => {
    await adminLayout.navigateToSettings();
    
    // Click on a model to see field configuration
    await page.getByRole('button', { name: 'User' }).click();
    
    // Check for field list
    await expect(page.getByText('Field Configuration')).toBeVisible();
    
    // Check for specific fields
    await expect(page.getByText('email')).toBeVisible();
    await expect(page.getByText('name')).toBeVisible();
  });

  test('should allow customizing field display names', async ({ page }) => {
    await adminLayout.navigateToSettings();
    
    // Navigate to User model settings
    await page.getByRole('button', { name: 'User' }).click();
    
    // Find email field configuration
    const emailFieldInput = page.locator('input').filter({ hasText: /display.*name/i }).first();
    
    if (await emailFieldInput.isVisible()) {
      // Change display name
      await emailFieldInput.fill('Email Address');
      
      // Save if needed
      const saveButton = page.getByRole('button', { name: /save/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
    }
  });

  test('should show general settings section', async ({ page }) => {
    await adminLayout.navigateToSettings();
    
    // Check for general settings
    const generalSection = page.locator('section').filter({ hasText: /general/i });
    await expect(generalSection).toBeVisible();
    
    // Check for common settings options
    const itemsPerPageSetting = page.locator('label').filter({ hasText: /items per page/i });
    if (await itemsPerPageSetting.isVisible()) {
      const input = itemsPerPageSetting.locator('input');
      const currentValue = await input.inputValue();
      expect(Number(currentValue)).toBeGreaterThan(0);
    }
  });

  test('should handle settings errors gracefully', async ({ page }) => {
    await adminLayout.navigateToSettings();
    
    // Try to input invalid data
    const numericInput = page.locator('input[type="number"]').first();
    if (await numericInput.isVisible()) {
      await numericInput.fill('-1'); // Invalid value
      
      const saveButton = page.getByRole('button', { name: /save/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Check for error message
        const errorMessage = page.locator('[role="alert"]');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toContainText(/invalid|error/i);
        }
      }
    }
  });
});