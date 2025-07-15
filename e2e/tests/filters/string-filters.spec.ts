import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { FilterPanel } from '../../pages/filter-panel';
import { TestDataGenerator } from '../../helpers/test-data';
import { ModelFormPage } from '../../pages/model-form';

test.describe('String Filter Tests', () => {
  let listPage: ModelListPage;
  let filterPanel: FilterPanel;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    filterPanel = new FilterPanel(page);
    formPage = new ModelFormPage(page);
    
    await page.goto('/admin/user');
    
    // Create test data with various string patterns
    const testUsers = [
      { email: 'admin@example.com', name: 'Admin User' },
      { email: 'test.user@example.com', name: 'Test User' },
      { email: 'john.doe@company.com', name: 'John Doe' },
      { email: 'jane.smith@company.com', name: 'Jane Smith' },
      { email: 'support@example.org', name: 'Support Team' },
    ];
    
    for (const user of testUsers) {
      await listPage.clickCreate();
      await formPage.fillField('Email', user.email);
      await formPage.fillField('Name', user.name);
      await formPage.submit();
      await formPage.waitForSuccess();
    }
  });

  test('should filter with "contains" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'example');
    await filterPanel.apply();
    
    // Verify results
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3); // admin@example.com, test.user@example.com, support@example.org
    
    // Check all results contain 'example'
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      expect(email.toLowerCase()).toContain('example');
    }
  });

  test('should filter with "starts with" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Name', 'starts with', 'J');
    await filterPanel.apply();
    
    // Should find John and Jane
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2);
    
    for (let i = 0; i < rowCount; i++) {
      const name = await listPage.getCellContent(i, 'name');
      expect(name).toMatch(/^J/);
    }
  });

  test('should filter with "ends with" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'ends with', '.com');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(4); // All except .org
    
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      expect(email).toMatch(/\.com$/);
    }
  });

  test('should filter with "equals" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'equals', 'admin@example.com');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const email = await listPage.getCellContent(0, 'email');
    expect(email).toBe('admin@example.com');
  });

  test('should filter with "not equals" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'not equals', 'admin@example.com');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(4); // All except admin
    
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      expect(email).not.toBe('admin@example.com');
    }
  });

  test('should filter with "is empty" operator', async ({ page }) => {
    // Create user without name
    await listPage.clickCreate();
    await formPage.fillField('Email', 'noname@example.com');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await filterPanel.open();
    await filterPanel.addFilter('Name', 'is empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
    
    // Check name is empty
    const name = await listPage.getCellContent(0, 'name');
    expect(name.trim()).toBe('');
  });

  test('should filter with "is not empty" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Name', 'is not empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    
    for (let i = 0; i < rowCount; i++) {
      const name = await listPage.getCellContent(i, 'name');
      expect(name.trim()).not.toBe('');
    }
  });

  test('should handle case sensitivity', async ({ page }) => {
    await filterPanel.open();
    
    // Test with different case
    await filterPanel.addFilter('Email', 'contains', 'EXAMPLE');
    await filterPanel.apply();
    
    // Should still find results (case-insensitive)
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should combine multiple string filters', async ({ page }) => {
    await filterPanel.open();
    
    // Email contains 'example' AND Name starts with 'A'
    await filterPanel.addFilter('Email', 'contains', 'example');
    await filterPanel.addFilter('Name', 'starts with', 'A');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1); // Only Admin User
    
    const email = await listPage.getCellContent(0, 'email');
    const name = await listPage.getCellContent(0, 'name');
    expect(email).toContain('example');
    expect(name).toMatch(/^A/);
  });

  test('should handle special characters', async ({ page }) => {
    // Create user with special characters
    await listPage.clickCreate();
    await formPage.fillField('Email', 'special+char@example.com');
    await formPage.fillField('Name', 'User (Special)');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', '+');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const email = await listPage.getCellContent(0, 'email');
    expect(email).toContain('+');
  });

  test('should escape regex characters', async ({ page }) => {
    // Create user with regex chars
    await listPage.clickCreate();
    await formPage.fillField('Email', 'user.test@example.com');
    await formPage.fillField('Name', 'Test User');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', '.');
    await filterPanel.apply();
    
    // Should find users with actual dots, not use . as wildcard
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      expect(email).toContain('.');
    }
  });

  test('should trim whitespace from filter values', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'equals', '  admin@example.com  ');
    await filterPanel.apply();
    
    // Should still find the user
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
  });

  test('should update results immediately', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'company');
    await filterPanel.apply();
    
    // Initial results
    let rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2); // john and jane
    
    // Modify filter
    await filterPanel.open();
    await filterPanel.removeFilter(0);
    await filterPanel.addFilter('Email', 'contains', 'example');
    await filterPanel.apply();
    
    // Updated results
    rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3);
  });

  test('should show no results message for non-matching filter', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'equals', 'nonexistent@example.com');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(0);
    
    // Check for empty state message
    const emptyMessage = page.locator('text=/no.*results|no.*found|empty/i');
    await expect(emptyMessage).toBeVisible();
  });

  test('should persist filter when sorting', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'example');
    await filterPanel.apply();
    
    // Apply sort
    const nameHeader = listPage.table.locator('th').filter({ hasText: /name/i });
    await nameHeader.click();
    
    // Filter should still be active
    const activeFilters = await filterPanel.hasActiveFilters();
    expect(activeFilters).toBe(true);
    
    // Results should still be filtered
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      expect(email).toContain('example');
    }
  });

  test('should export filtered results', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'company');
    await filterPanel.apply();
    
    // Check if export button respects filters
    if (await listPage.exportButton.isVisible()) {
      // Export functionality should export only filtered results
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBe(2); // Only company emails
    }
  });

  test('should work with pagination', async ({ page }) => {
    // Create many users
    for (let i = 0; i < 30; i++) {
      await listPage.clickCreate();
      await formPage.fillField('Email', `user${i}@example.com`);
      await formPage.fillField('Name', `User ${i}`);
      await formPage.submit();
      await formPage.waitForSuccess();
    }
    
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'example');
    await filterPanel.apply();
    
    // Navigate pages
    if (await listPage.pagination.getByRole('button', { name: '2' }).isVisible()) {
      await listPage.goToPage(2);
      
      // Filter should still apply
      const rowCount = await listPage.getRowCount();
      for (let i = 0; i < rowCount; i++) {
        const email = await listPage.getCellContent(i, 'email');
        expect(email).toContain('example');
      }
    }
  });
});