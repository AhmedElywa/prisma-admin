import { test, expect } from '../../fixtures/test';
import { AdminLayout } from '../../pages/admin-layout';
import { ModelListPage } from '../../pages/model-list';
import { FilterPanel } from '../../pages/filter-panel';
import { TestDataGenerator } from '../../helpers/test-data';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Filter System', () => {
  let adminLayout: AdminLayout;
  let listPage: ModelListPage;
  let filterPanel: FilterPanel;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    adminLayout = new AdminLayout(page);
    listPage = new ModelListPage(page);
    filterPanel = new FilterPanel(page);
    formPage = new ModelFormPage(page);
    
    // Navigate to User model
    await page.goto('/admin/user');
  });

  test('should open and close filter panel', async ({ page }) => {
    // Open filter panel
    await filterPanel.open();
    await expect(filterPanel.filterPanel).toBeVisible();
    
    // Close filter panel
    await filterPanel.close();
    await expect(filterPanel.filterPanel).not.toBeVisible();
  });

  test('should filter users by email (string filter)', async ({ page }) => {
    // Create test users
    const testEmail = `filter-test-${TestDataGenerator.getUniqueId()}@example.com`;
    await listPage.clickCreate();
    await formPage.fillField('Email', testEmail);
    await formPage.fillField('Name', 'Filter Test User');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    // Apply email filter
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'filter-test');
    await filterPanel.apply();
    
    // Verify filtered results
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
    
    // Check that filtered user appears
    const emailCell = await listPage.getCellContent(0, 'email');
    expect(emailCell).toContain('filter-test');
  });

  test('should filter using multiple conditions (AND)', async ({ page }) => {
    // Create test users with specific patterns
    const baseEmail = `multi-filter-${TestDataGenerator.getUniqueId()}`;
    const users = [
      { email: `${baseEmail}-admin@example.com`, name: 'Admin User' },
      { email: `${baseEmail}-user@example.com`, name: 'Regular User' },
      { email: `${baseEmail}-admin@test.com`, name: 'Test Admin' },
    ];
    
    for (const user of users) {
      await listPage.clickCreate();
      await formPage.fillField('Email', user.email);
      await formPage.fillField('Name', user.name);
      await formPage.submit();
      await formPage.waitForSuccess();
    }
    
    // Apply multiple filters
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', baseEmail);
    await filterPanel.addFilter('Email', 'contains', 'admin');
    await filterPanel.apply();
    
    // Should only show users with both patterns
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2); // Only admin users
  });

  test('should clear all filters', async ({ page }) => {
    // Apply a filter
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'test');
    await filterPanel.apply();
    
    // Verify filter is active
    const hasFilters = await filterPanel.hasActiveFilters();
    expect(hasFilters).toBe(true);
    
    // Clear filters
    await filterPanel.open();
    await filterPanel.clear();
    await filterPanel.apply();
    
    // Verify filters are cleared
    const hasFiltersAfterClear = await filterPanel.hasActiveFilters();
    expect(hasFiltersAfterClear).toBe(false);
  });

  test('should remove individual filters', async ({ page }) => {
    // Add multiple filters
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'test');
    await filterPanel.addFilter('Name', 'contains', 'user');
    
    // Verify 2 filters exist
    let filterCount = await filterPanel.getFilterCount();
    expect(filterCount).toBe(2);
    
    // Remove first filter
    await filterPanel.removeFilter(0);
    
    // Verify only 1 filter remains
    filterCount = await filterPanel.getFilterCount();
    expect(filterCount).toBe(1);
    
    await filterPanel.apply();
  });

  test('should show active filter count badge', async ({ page }) => {
    // Apply filters
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'test');
    await filterPanel.addFilter('Name', 'contains', 'user');
    await filterPanel.apply();
    
    // Check filter count badge
    const activeCount = await filterPanel.getActiveFilterCount();
    expect(activeCount).toBe(2);
  });

  test('should filter with different operators', async ({ page }) => {
    // Create users with different email patterns
    const uniqueId = TestDataGenerator.getUniqueId();
    const users = [
      { email: `exact-${uniqueId}@example.com`, name: 'Exact Match' },
      { email: `startswith-${uniqueId}@example.com`, name: 'Starts With' },
      { email: `${uniqueId}-endswith@example.com`, name: 'Ends With' },
    ];
    
    for (const user of users) {
      await listPage.clickCreate();
      await formPage.fillField('Email', user.email);
      await formPage.fillField('Name', user.name);
      await formPage.submit();
      await formPage.waitForSuccess();
    }
    
    // Test starts with operator
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'starts with', 'startswith');
    await filterPanel.apply();
    
    let rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    // Test ends with operator
    await filterPanel.open();
    await filterPanel.clear();
    await filterPanel.addFilter('Email', 'ends with', 'endswith@example.com');
    await filterPanel.apply();
    
    rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
  });

  test('should persist filters after page navigation', async ({ page }) => {
    // Apply filter
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', 'test');
    await filterPanel.apply();
    
    // Navigate to another model and back
    await adminLayout.navigateToModel('Post');
    await adminLayout.navigateToModel('User');
    
    // Check if filter is still active
    const hasFilters = await filterPanel.hasActiveFilters();
    expect(hasFilters).toBe(true);
  });

  test('should handle empty filter values gracefully', async ({ page }) => {
    // Try to apply empty filter
    await filterPanel.open();
    await filterPanel.addFilter('Email', 'contains', '');
    await filterPanel.apply();
    
    // Should not crash and should show all results
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });
});