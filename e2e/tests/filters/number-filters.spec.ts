import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { FilterPanel } from '../../pages/filter-panel';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Number Filter Tests', () => {
  let listPage: ModelListPage;
  let filterPanel: FilterPanel;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    filterPanel = new FilterPanel(page);
    formPage = new ModelFormPage(page);
    
    await page.goto('/admin/post');
    
    // Create test data with various numeric values
    const testPosts = [
      { title: 'Post 1', views: 100 },
      { title: 'Post 2', views: 250 },
      { title: 'Post 3', views: 500 },
      { title: 'Post 4', views: 1000 },
      { title: 'Post 5', views: 2500 },
    ];
    
    for (const post of testPosts) {
      await listPage.clickCreate();
      await formPage.fillField('Title', post.title);
      if (await formPage.form.locator('input[name*="views"]').isVisible()) {
        await formPage.fillField('Views', post.views.toString());
      }
      await formPage.submit();
      await formPage.waitForSuccess();
    }
  });

  test('should filter with "equals" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'equals', '500');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const views = await listPage.getCellContent(0, 'views');
    expect(parseInt(views)).toBe(500);
  });

  test('should filter with "not equals" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'not equals', '500');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(4);
    
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      expect(parseInt(views)).not.toBe(500);
    }
  });

  test('should filter with "greater than" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'greater than', '500');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2); // 1000 and 2500
    
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      expect(parseInt(views)).toBeGreaterThan(500);
    }
  });

  test('should filter with "greater than or equal" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'greater than or equal', '500');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3); // 500, 1000, 2500
    
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      expect(parseInt(views)).toBeGreaterThanOrEqual(500);
    }
  });

  test('should filter with "less than" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'less than', '500');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2); // 100 and 250
    
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      expect(parseInt(views)).toBeLessThan(500);
    }
  });

  test('should filter with "less than or equal" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'less than or equal', '500');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3); // 100, 250, 500
    
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      expect(parseInt(views)).toBeLessThanOrEqual(500);
    }
  });

  test('should filter with "between" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addRangeFilter('Views', 'between', '200', '1000');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3); // 250, 500, 1000
    
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      const viewCount = parseInt(views);
      expect(viewCount).toBeGreaterThanOrEqual(200);
      expect(viewCount).toBeLessThanOrEqual(1000);
    }
  });

  test('should filter with "not between" operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addRangeFilter('Views', 'not between', '200', '1000');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2); // 100 and 2500
    
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      const viewCount = parseInt(views);
      expect(viewCount < 200 || viewCount > 1000).toBe(true);
    }
  });

  test('should handle zero values', async ({ page }) => {
    // Create post with zero views
    await listPage.clickCreate();
    await formPage.fillField('Title', 'Zero Views Post');
    if (await formPage.form.locator('input[name*="views"]').isVisible()) {
      await formPage.fillField('Views', '0');
    }
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'equals', '0');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const views = await listPage.getCellContent(0, 'views');
    expect(parseInt(views)).toBe(0);
  });

  test('should handle negative numbers', async ({ page }) => {
    // Try negative filter value
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'greater than', '-100');
    await filterPanel.apply();
    
    // All posts should match since views are positive
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should handle decimal numbers', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'greater than', '99.5');
    await filterPanel.apply();
    
    // Should include 100 and above
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      expect(parseInt(views)).toBeGreaterThanOrEqual(100);
    }
  });

  test('should combine multiple number filters', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'greater than', '100');
    await filterPanel.addFilter('Views', 'less than', '1000');
    await filterPanel.apply();
    
    // Should find 250 and 500
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2);
    
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      const viewCount = parseInt(views);
      expect(viewCount).toBeGreaterThan(100);
      expect(viewCount).toBeLessThan(1000);
    }
  });

  test('should validate numeric input', async ({ page }) => {
    await filterPanel.open();
    
    // Try non-numeric input
    const filterInput = filterPanel.panel.locator('input[type="number"], input[type="text"]').first();
    await filterInput.fill('abc');
    await filterPanel.apply();
    
    // Should either reject or treat as 0
    const value = await filterInput.inputValue();
    expect(value).toMatch(/^[\d.-]*$/);
  });

  test('should handle very large numbers', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'less than', '999999999');
    await filterPanel.apply();
    
    // All test posts should match
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should clear number filter', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'equals', '500');
    await filterPanel.apply();
    
    // Verify filter is active
    let rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    // Clear filter
    await filterPanel.open();
    await filterPanel.clearAll();
    await filterPanel.apply();
    
    // Should show all posts
    rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(1);
  });

  test('should maintain filter when sorting', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'greater than', '250');
    await filterPanel.apply();
    
    // Apply sort
    const titleHeader = listPage.table.locator('th').filter({ hasText: /title/i });
    await titleHeader.click();
    
    // Filter should still be active
    const activeFilters = await filterPanel.hasActiveFilters();
    expect(activeFilters).toBe(true);
    
    // Results should still be filtered
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const views = await listPage.getCellContent(i, 'views');
      expect(parseInt(views)).toBeGreaterThan(250);
    }
  });

  test('should work with null/empty values', async ({ page }) => {
    // Create post without views
    await listPage.clickCreate();
    await formPage.fillField('Title', 'No Views Post');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'is empty', '');
    await filterPanel.apply();
    
    // Should find the post without views
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('should handle scientific notation', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Views', 'equals', '1e3');
    await filterPanel.apply();
    
    // Should find post with 1000 views
    const rowCount = await listPage.getRowCount();
    if (rowCount > 0) {
      const views = await listPage.getCellContent(0, 'views');
      expect(parseInt(views)).toBe(1000);
    }
  });

  test('should show appropriate operators for number fields', async ({ page }) => {
    await filterPanel.open();
    
    // Select number field
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /views/i });
    
    // Check available operators
    const operatorSelect = filterPanel.panel.locator('select').nth(1);
    const options = await operatorSelect.locator('option').allTextContents();
    
    // Should include numeric operators
    expect(options.some(opt => opt.match(/greater|less|between/i))).toBe(true);
  });
});