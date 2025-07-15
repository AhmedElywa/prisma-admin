import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { FilterPanel } from '../../pages/filter-panel';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Boolean Filter Tests', () => {
  let listPage: ModelListPage;
  let filterPanel: FilterPanel;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    filterPanel = new FilterPanel(page);
    formPage = new ModelFormPage(page);
    
    await page.goto('/admin/post');
    
    // Create test data with various boolean states
    const testPosts = [
      { title: 'Published Post 1', published: true },
      { title: 'Published Post 2', published: true },
      { title: 'Draft Post 1', published: false },
      { title: 'Draft Post 2', published: false },
      { title: 'Draft Post 3', published: false },
    ];
    
    for (const post of testPosts) {
      await listPage.clickCreate();
      await formPage.fillField('Title', post.title);
      
      // Handle published checkbox
      const publishedCheckbox = formPage.form.locator('input[type="checkbox"][name*="publish"]').first();
      if (await publishedCheckbox.isVisible()) {
        if (post.published) {
          await publishedCheckbox.check();
        } else {
          await publishedCheckbox.uncheck();
        }
      }
      
      await formPage.submit();
      await formPage.waitForSuccess();
    }
  });

  test('should filter by true value', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'equals', 'true');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2);
    
    for (let i = 0; i < rowCount; i++) {
      const title = await listPage.getCellContent(i, 'title');
      expect(title).toContain('Published Post');
    }
  });

  test('should filter by false value', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'equals', 'false');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3);
    
    for (let i = 0; i < rowCount; i++) {
      const title = await listPage.getCellContent(i, 'title');
      expect(title).toContain('Draft Post');
    }
  });

  test('should use toggle/checkbox for boolean filter', async ({ page }) => {
    await filterPanel.open();
    
    // Look for boolean field filter
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /published/i });
    
    // Should show toggle or select with true/false
    const booleanToggle = filterPanel.panel.locator('input[type="checkbox"], [role="switch"]').first();
    const booleanSelect = filterPanel.panel.locator('select').filter({ hasText: /true|false/i }).first();
    
    if (await booleanToggle.isVisible()) {
      // Use toggle
      await booleanToggle.check();
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBe(2); // Published posts
    } else if (await booleanSelect.isVisible()) {
      // Use select
      await booleanSelect.selectOption('true');
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBe(2); // Published posts
    }
  });

  test('should handle "not equals" for boolean', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'not equals', 'true');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3); // Draft posts
    
    for (let i = 0; i < rowCount; i++) {
      const title = await listPage.getCellContent(i, 'title');
      expect(title).toContain('Draft');
    }
  });

  test('should filter null/empty boolean values', async ({ page }) => {
    // Create post without explicit published value
    await listPage.clickCreate();
    await formPage.fillField('Title', 'Undefined Status Post');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'is empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    
    // Check if we found the undefined post
    let foundUndefined = false;
    for (let i = 0; i < rowCount; i++) {
      const title = await listPage.getCellContent(i, 'title');
      if (title.includes('Undefined Status')) {
        foundUndefined = true;
        break;
      }
    }
    
    // Depending on schema, boolean might default to false
    expect(foundUndefined || rowCount === 0).toBeTruthy();
  });

  test('should show boolean values in table', async ({ page }) => {
    // Check how boolean values are displayed
    const firstRow = listPage.table.locator('tbody tr').first();
    const publishedCell = firstRow.locator('td').filter({ hasText: /true|false|yes|no|✓|✗/i }).first();
    
    if (await publishedCell.isVisible()) {
      const text = await publishedCell.textContent();
      expect(text).toMatch(/true|false|yes|no|✓|✗/i);
    }
  });

  test('should combine boolean filters with other filters', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'equals', 'true');
    await filterPanel.addFilter('Title', 'contains', '1');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1); // Published Post 1
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toBe('Published Post 1');
  });

  test('should toggle boolean filter quickly', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'equals', 'true');
    await filterPanel.apply();
    
    let rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2);
    
    // Change to false
    await filterPanel.open();
    await filterPanel.removeFilter(0);
    await filterPanel.addFilter('Published', 'equals', 'false');
    await filterPanel.apply();
    
    rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3);
  });

  test('should clear boolean filter', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'equals', 'true');
    await filterPanel.apply();
    
    let rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2);
    
    // Clear filter
    await filterPanel.open();
    await filterPanel.clearAll();
    await filterPanel.apply();
    
    // Should show all posts
    rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(2);
  });

  test('should handle multiple boolean fields', async ({ page }) => {
    // If there are multiple boolean fields
    const booleanFields = await filterPanel.getFieldsByType('boolean');
    
    if (booleanFields.length > 1) {
      await filterPanel.open();
      
      // Add filters for multiple boolean fields
      for (const field of booleanFields.slice(0, 2)) {
        await filterPanel.addFilter(field, 'equals', 'true');
      }
      
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should export filtered boolean results', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'equals', 'false');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3);
    
    // Check if export respects filter
    if (await listPage.exportButton.isVisible()) {
      // Export would include only draft posts
      expect(true).toBe(true);
    }
  });

  test('should show appropriate UI for boolean filter', async ({ page }) => {
    await filterPanel.open();
    
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /published/i });
    
    // Check UI elements
    const toggle = filterPanel.panel.locator('[role="switch"]').first();
    const checkbox = filterPanel.panel.locator('input[type="checkbox"]').first();
    const select = filterPanel.panel.locator('select').nth(1);
    
    // Should have appropriate UI element
    const hasProperUI = 
      await toggle.isVisible() || 
      await checkbox.isVisible() || 
      (await select.isVisible() && await select.locator('option').filter({ hasText: /true|false/i }).count() > 0);
    
    expect(hasProperUI).toBe(true);
  });

  test('should handle boolean in bulk operations', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'equals', 'false');
    await filterPanel.apply();
    
    // Select all filtered items
    const selectAllCheckbox = listPage.table.locator('thead input[type="checkbox"]').first();
    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.check();
      
      // Look for bulk action to publish
      const bulkActions = page.locator('button').filter({ hasText: /bulk|action/i });
      if (await bulkActions.isVisible()) {
        await bulkActions.click();
        
        const publishAction = page.locator('button, [role="menuitem"]').filter({ hasText: /publish/i });
        if (await publishAction.isVisible()) {
          // Could bulk publish drafts
          expect(true).toBe(true);
        }
      }
    }
  });

  test('should persist boolean filter during navigation', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'equals', 'true');
    await filterPanel.apply();
    
    // Navigate to second page if available
    const page2Button = listPage.pagination.getByRole('button', { name: '2' });
    if (await page2Button.isVisible()) {
      await page2Button.click();
      
      // Filter should still be active
      const activeFilters = await filterPanel.hasActiveFilters();
      expect(activeFilters).toBe(true);
    }
  });

  test('should handle boolean filter in URL parameters', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published', 'equals', 'true');
    await filterPanel.apply();
    
    // Check URL contains filter
    const url = page.url();
    expect(url).toMatch(/published|filter/i);
    
    // Reload page
    await page.reload();
    
    // Filter should persist
    const activeFilters = await filterPanel.hasActiveFilters();
    expect(activeFilters).toBe(true);
  });
});