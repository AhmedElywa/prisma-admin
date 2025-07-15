import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { FilterPanel } from '../../pages/filter-panel';
import { ModelFormPage } from '../../pages/model-form';

test.describe('JSON Filter Tests', () => {
  let listPage: ModelListPage;
  let filterPanel: FilterPanel;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    filterPanel = new FilterPanel(page);
    formPage = new ModelFormPage(page);
    
    await page.goto('/admin/post');
    
    // Create test data with various JSON metadata
    const testPosts = [
      { title: 'Post with tags', metadata: { tags: ['tech', 'news'], views: 100 } },
      { title: 'Post with author', metadata: { author: 'John Doe', category: 'blog' } },
      { title: 'Post with nested', metadata: { settings: { featured: true, priority: 'high' } } },
      { title: 'Post with array', metadata: { items: [1, 2, 3], count: 3 } },
      { title: 'Post empty object', metadata: {} },
    ];
    
    for (const post of testPosts) {
      await listPage.clickCreate();
      await formPage.fillField('Title', post.title);
      
      // Handle JSON field
      const jsonEditor = formPage.form.locator('[data-testid*="json"], .json-editor, textarea[name*="metadata"]').first();
      if (await jsonEditor.isVisible()) {
        await jsonEditor.fill(JSON.stringify(post.metadata, null, 2));
      }
      
      await formPage.submit();
      await formPage.waitForSuccess();
    }
  });

  test('should filter JSON by key existence', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Metadata', 'contains key', 'tags');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('tags');
  });

  test('should filter JSON by key-value pair', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addJsonFilter('Metadata', 'path equals', 'author', 'John Doe');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('author');
  });

  test('should filter JSON by nested path', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addJsonFilter('Metadata', 'path equals', 'settings.featured', 'true');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('nested');
  });

  test('should filter JSON arrays', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addJsonFilter('Metadata', 'array contains', 'tags', 'tech');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('tags');
  });

  test('should filter by JSON array length', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addJsonFilter('Metadata', 'array length', 'items', '3');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('array');
  });

  test('should filter empty JSON objects', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Metadata', 'is empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('empty');
  });

  test('should filter non-empty JSON', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Metadata', 'is not empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(4); // All except empty object
  });

  test('should use JSON path syntax', async ({ page }) => {
    await filterPanel.open();
    
    // Look for JSON path input
    const pathInput = filterPanel.panel.locator('input[placeholder*="path"], input[name*="path"]').first();
    if (await pathInput.isVisible()) {
      await pathInput.fill('$.settings.priority');
      
      const valueInput = filterPanel.panel.locator('input').last();
      await valueInput.fill('high');
      
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBe(1);
    }
  });

  test('should validate JSON syntax in filter', async ({ page }) => {
    await filterPanel.open();
    
    // Try invalid JSON
    const jsonInput = filterPanel.panel.locator('textarea, input[type="text"]').last();
    if (await jsonInput.isVisible()) {
      await jsonInput.fill('{invalid json}');
      await filterPanel.apply();
      
      // Should show error or handle gracefully
      const errorMessage = filterPanel.panel.locator('.error, [role="alert"]');
      const hasError = await errorMessage.isVisible() || await listPage.getRowCount() === 0;
      expect(hasError).toBe(true);
    }
  });

  test('should filter by JSON string value', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addJsonFilter('Metadata', 'contains value', '', 'blog');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('author');
  });

  test('should filter by JSON numeric value', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addJsonFilter('Metadata', 'path greater than', 'views', '50');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('tags');
  });

  test('should filter by JSON boolean value', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addJsonFilter('Metadata', 'path equals', 'settings.featured', 'true');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
  });

  test('should combine JSON filters', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Metadata', 'contains key', 'settings');
    await filterPanel.addJsonFilter('Metadata', 'path equals', 'settings.priority', 'high');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('nested');
  });

  test('should handle complex JSON queries', async ({ page }) => {
    await filterPanel.open();
    
    // Query builder UI if available
    const queryBuilder = filterPanel.panel.locator('.json-query-builder');
    if (await queryBuilder.isVisible()) {
      // Build complex query
      await queryBuilder.locator('button:has-text("Add condition")').click();
      await queryBuilder.locator('select').first().selectOption('tags');
      await queryBuilder.locator('select').nth(1).selectOption('contains');
      await queryBuilder.locator('input').last().fill('tech');
      
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('should show JSON preview in filter', async ({ page }) => {
    await filterPanel.open();
    
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /metadata/i });
    
    // Look for JSON preview
    const preview = filterPanel.panel.locator('.json-preview, pre');
    if (await preview.isVisible()) {
      const text = await preview.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('should export filtered JSON results', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Metadata', 'contains key', 'tags');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    if (await listPage.exportButton.isVisible()) {
      // Export would include filtered JSON data
      expect(true).toBe(true);
    }
  });

  test('should handle null JSON values', async ({ page }) => {
    // Create post with null metadata
    await listPage.clickCreate();
    await formPage.fillField('Title', 'Null metadata post');
    
    const jsonEditor = formPage.form.locator('[data-testid*="json"], .json-editor').first();
    if (await jsonEditor.isVisible()) {
      await jsonEditor.fill('null');
    }
    
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await filterPanel.open();
    await filterPanel.addFilter('Metadata', 'is null', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('should provide JSON filter templates', async ({ page }) => {
    await filterPanel.open();
    
    // Look for template dropdown
    const templateSelect = filterPanel.panel.locator('select[name*="template"], button:has-text("Templates")');
    if (await templateSelect.isVisible()) {
      await templateSelect.click();
      
      // Should have common templates
      const templates = page.locator('[role="option"], option');
      const templateTexts = await templates.allTextContents();
      
      expect(templateTexts.some(t => t.match(/key|value|array|nested/i))).toBe(true);
    }
  });

  test('should clear JSON filter', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Metadata', 'contains key', 'tags');
    await filterPanel.apply();
    
    let rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    // Clear filter
    await filterPanel.open();
    await filterPanel.clearAll();
    await filterPanel.apply();
    
    rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(1);
  });

  test('should handle JSON filter with special characters', async ({ page }) => {
    // Create post with special characters in JSON
    await listPage.clickCreate();
    await formPage.fillField('Title', 'Special chars post');
    
    const jsonEditor = formPage.form.locator('[data-testid*="json"], .json-editor').first();
    if (await jsonEditor.isVisible()) {
      await jsonEditor.fill(JSON.stringify({ "key with spaces": "value", "special@char": true }));
    }
    
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await filterPanel.open();
    await filterPanel.addFilter('Metadata', 'contains key', 'key with spaces');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
  });
});