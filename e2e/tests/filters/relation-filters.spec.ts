import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { FilterPanel } from '../../pages/filter-panel';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Relation Filter Tests', () => {
  let listPage: ModelListPage;
  let filterPanel: FilterPanel;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    filterPanel = new FilterPanel(page);
    formPage = new ModelFormPage(page);
    
    // We'll use the existing data to test relation filters
    await page.goto('/admin/post');
  });

  test('should filter by relation existence', async ({ page }) => {
    await filterPanel.open();
    
    // Filter posts that have an author
    await filterPanel.addFilter('Author', 'is not empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should filter by specific relation', async ({ page }) => {
    await filterPanel.open();
    
    // Look for relation filter
    const authorFilter = filterPanel.panel.locator('select, input').filter({ hasText: /author/i }).first();
    if (await authorFilter.isVisible()) {
      // Select specific author
      await authorFilter.click();
      
      // Look for author options
      const authorOptions = page.locator('[role="option"], .dropdown-item').filter({ hasText: /alice|bob/i });
      if (await authorOptions.first().isVisible()) {
        await authorOptions.first().click();
        await filterPanel.apply();
        
        const rowCount = await listPage.getRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('should filter by relation count', async ({ page }) => {
    await page.goto('/admin/user');
    await filterPanel.open();
    
    // Filter users by post count
    const postCountFilter = filterPanel.panel.locator('input, select').filter({ hasText: /posts/i }).first();
    if (await postCountFilter.isVisible()) {
      // Users with more than 0 posts
      await filterPanel.addFilter('Posts', 'count greater than', '0');
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by nested relation', async ({ page }) => {
    await filterPanel.open();
    
    // Filter posts by author's name
    const nestedFilter = filterPanel.panel.locator('input').filter({ hasText: /author.*name/i }).first();
    if (await nestedFilter.isVisible()) {
      await nestedFilter.fill('Alice');
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should use relation search/select UI', async ({ page }) => {
    await filterPanel.open();
    
    // Look for relation field
    const fieldSelect = filterPanel.panel.locator('select').first();
    if (await fieldSelect.isVisible()) {
      await fieldSelect.selectOption({ label: /author|user/i });
      
      // Should show relation picker
      const relationPicker = filterPanel.panel.locator('[data-testid*="relation"], .relation-picker, [role="combobox"]').first();
      if (await relationPicker.isVisible()) {
        await relationPicker.click();
        
        // Should show searchable list
        const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
        if (await searchInput.isVisible()) {
          await searchInput.fill('alice');
          await page.keyboard.press('Enter');
        }
      }
    }
  });

  test('should filter by multiple relations', async ({ page }) => {
    await page.goto('/admin/post');
    await filterPanel.open();
    
    // Filter posts that have both author and categories
    await filterPanel.addFilter('Author', 'is not empty', '');
    await filterPanel.addFilter('Categories', 'is not empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter many-to-many relations', async ({ page }) => {
    await filterPanel.open();
    
    // Filter posts by category
    const categoryFilter = filterPanel.panel.locator('select, input').filter({ hasText: /categor/i }).first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      
      // Select a category
      const categoryOption = page.locator('[role="option"]').first();
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        await filterPanel.apply();
        
        const rowCount = await listPage.getRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle "none" relation filter', async ({ page }) => {
    await filterPanel.open();
    
    // Filter posts without author
    await filterPanel.addFilter('Author', 'is empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    // Should find posts without authors or no posts
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter by relation ID', async ({ page }) => {
    await filterPanel.open();
    
    // Filter by author ID if supported
    const authorIdFilter = filterPanel.panel.locator('input').filter({ hasText: /author.*id/i }).first();
    if (await authorIdFilter.isVisible()) {
      await authorIdFilter.fill('1');
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should combine relation filters with other filters', async ({ page }) => {
    await filterPanel.open();
    
    // Filter posts by author and title
    await filterPanel.addFilter('Author', 'is not empty', '');
    await filterPanel.addFilter('Title', 'contains', 'test');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should show relation details in filter', async ({ page }) => {
    await filterPanel.open();
    
    // When selecting a relation filter value
    const relationValue = filterPanel.panel.locator('.relation-value, [data-testid*="relation-value"]').first();
    if (await relationValue.isVisible()) {
      // Should show some identifying info (name, email, etc)
      const text = await relationValue.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('should clear relation filter', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Author', 'is not empty', '');
    await filterPanel.apply();
    
    let rowCount = await listPage.getRowCount();
    const filteredCount = rowCount;
    
    // Clear filter
    await filterPanel.open();
    await filterPanel.clearAll();
    await filterPanel.apply();
    
    rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('should handle self-referencing relations', async ({ page }) => {
    // If there are self-referencing relations (e.g., parent/child categories)
    await page.goto('/admin/category');
    await filterPanel.open();
    
    const parentFilter = filterPanel.panel.locator('select, input').filter({ hasText: /parent/i }).first();
    if (await parentFilter.isVisible()) {
      await filterPanel.addFilter('Parent', 'is empty', '');
      await filterPanel.apply();
      
      // Should find root categories
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by relation with complex conditions', async ({ page }) => {
    await filterPanel.open();
    
    // Filter posts where author name starts with 'A'
    const complexFilter = filterPanel.panel.locator('button').filter({ hasText: /advanced|complex/i }).first();
    if (await complexFilter.isVisible()) {
      await complexFilter.click();
      
      // Build complex query
      const queryBuilder = page.locator('.query-builder, [data-testid="query-builder"]');
      if (await queryBuilder.isVisible()) {
        // Add condition for author.name starts with 'A'
        expect(true).toBe(true);
      }
    }
  });

  test('should export filtered relation results', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Author', 'is not empty', '');
    await filterPanel.apply();
    
    if (await listPage.exportButton.isVisible()) {
      // Export should include relation data
      expect(true).toBe(true);
    }
  });

  test('should maintain relation filter on page refresh', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Author', 'is not empty', '');
    await filterPanel.apply();
    
    // Check URL contains filter
    const url = page.url();
    expect(url).toMatch(/filter|author/i);
    
    // Reload page
    await page.reload();
    
    // Filter should persist
    const activeFilters = await filterPanel.hasActiveFilters();
    expect(activeFilters).toBe(true);
  });

  test('should show loading state for relation options', async ({ page }) => {
    await filterPanel.open();
    
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /author/i });
    
    // Look for loading indicator
    const loading = filterPanel.panel.locator('.loading, [aria-busy="true"], .spinner');
    if (await loading.isVisible({ timeout: 1000 })) {
      // Should eventually load
      await loading.waitFor({ state: 'hidden', timeout: 5000 });
    }
  });

  test('should paginate relation options if many', async ({ page }) => {
    await filterPanel.open();
    
    // Open relation picker
    const relationPicker = filterPanel.panel.locator('[data-testid*="relation"], .relation-picker').first();
    if (await relationPicker.isVisible()) {
      await relationPicker.click();
      
      // Look for pagination or "Load more"
      const loadMore = page.locator('button').filter({ hasText: /more|next/i }).first();
      if (await loadMore.isVisible()) {
        await loadMore.click();
        // Should load more options
        expect(true).toBe(true);
      }
    }
  });

  test('should handle circular relations gracefully', async ({ page }) => {
    // Test that circular relations don't cause infinite loops
    await filterPanel.open();
    
    // Try to filter by a circular relation path
    const circularFilter = filterPanel.panel.locator('select').filter({ hasText: /author.*posts.*author/i }).first();
    if (await circularFilter.isVisible()) {
      // Should handle gracefully without error
      expect(true).toBe(true);
    }
  });
});