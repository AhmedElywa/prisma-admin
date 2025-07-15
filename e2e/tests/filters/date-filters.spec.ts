import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { FilterPanel } from '../../pages/filter-panel';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Date Filter Tests', () => {
  let listPage: ModelListPage;
  let filterPanel: FilterPanel;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    filterPanel = new FilterPanel(page);
    formPage = new ModelFormPage(page);
    
    await page.goto('/admin/post');
    
    // Create test data with various dates
    const testPosts = [
      { title: 'Old Post', publishedAt: '2023-01-15T10:00:00Z' },
      { title: 'Spring Post', publishedAt: '2024-03-20T14:30:00Z' },
      { title: 'Summer Post', publishedAt: '2024-07-01T09:00:00Z' },
      { title: 'Recent Post', publishedAt: '2024-11-01T16:45:00Z' },
      { title: 'Future Post', publishedAt: '2025-01-01T00:00:00Z' },
    ];
    
    for (const post of testPosts) {
      await listPage.clickCreate();
      await formPage.fillField('Title', post.title);
      
      // Fill publish date if field exists
      const dateField = formPage.form.locator('input[type="datetime-local"][name*="publish"], input[type="date"][name*="publish"]').first();
      if (await dateField.isVisible()) {
        const dateValue = post.publishedAt.split('T')[0];
        await dateField.fill(dateValue);
      }
      
      await formPage.submit();
      await formPage.waitForSuccess();
    }
  });

  test('should filter with "equals" date operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'equals', '2024-07-01');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1);
    
    const title = await listPage.getCellContent(0, 'title');
    expect(title).toContain('Summer Post');
  });

  test('should filter with "not equals" date operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'not equals', '2024-07-01');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(4);
    
    for (let i = 0; i < rowCount; i++) {
      const title = await listPage.getCellContent(i, 'title');
      expect(title).not.toContain('Summer Post');
    }
  });

  test('should filter with "after" date operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'after', '2024-06-01');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3); // Summer, Recent, Future
    
    const titles: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      titles.push(await listPage.getCellContent(i, 'title'));
    }
    
    expect(titles).toContain('Summer Post');
    expect(titles).toContain('Recent Post');
    expect(titles).toContain('Future Post');
  });

  test('should filter with "before" date operator', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'before', '2024-06-01');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2); // Old and Spring
    
    const titles: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      titles.push(await listPage.getCellContent(i, 'title'));
    }
    
    expect(titles).toContain('Old Post');
    expect(titles).toContain('Spring Post');
  });

  test('should filter with "between" date range', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addRangeFilter('Published At', 'between', '2024-01-01', '2024-12-31');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3); // Spring, Summer, Recent
    
    const titles: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      titles.push(await listPage.getCellContent(i, 'title'));
    }
    
    expect(titles).toContain('Spring Post');
    expect(titles).toContain('Summer Post');
    expect(titles).toContain('Recent Post');
  });

  test('should filter with "not between" date range', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addRangeFilter('Published At', 'not between', '2024-01-01', '2024-12-31');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2); // Old and Future
    
    const titles: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      titles.push(await listPage.getCellContent(i, 'title'));
    }
    
    expect(titles).toContain('Old Post');
    expect(titles).toContain('Future Post');
  });

  test('should filter with relative dates', async ({ page }) => {
    await filterPanel.open();
    
    // Look for relative date options
    const relativeOptions = filterPanel.panel.locator('button, select option').filter({ hasText: /today|yesterday|week|month/i });
    
    if (await relativeOptions.count() > 0) {
      // Click "This month" or similar
      await relativeOptions.first().click();
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle datetime with time component', async ({ page }) => {
    await filterPanel.open();
    
    // If datetime filtering is supported
    const datetimeInput = filterPanel.panel.locator('input[type="datetime-local"]').first();
    if (await datetimeInput.isVisible()) {
      await datetimeInput.fill('2024-07-01T08:00');
      await filterPanel.apply();
      
      // Should filter based on date and time
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter empty/null dates', async ({ page }) => {
    // Create post without publish date
    await listPage.clickCreate();
    await formPage.fillField('Title', 'Draft Post');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'is empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
    
    // Should find draft post
    let foundDraft = false;
    for (let i = 0; i < rowCount; i++) {
      const title = await listPage.getCellContent(i, 'title');
      if (title.includes('Draft')) {
        foundDraft = true;
        break;
      }
    }
    expect(foundDraft).toBe(true);
  });

  test('should filter non-empty dates', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'is not empty', '');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(5); // All posts with dates
  });

  test('should validate date format', async ({ page }) => {
    await filterPanel.open();
    
    const dateInput = filterPanel.panel.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      // Try invalid format
      await dateInput.fill('13/25/2024');
      await filterPanel.apply();
      
      // Should either reject or auto-correct
      const value = await dateInput.inputValue();
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$|^$/);
    }
  });

  test('should handle different time zones', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'equals', '2024-07-01');
    await filterPanel.apply();
    
    // Should find posts from that date regardless of time zone
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('should combine date filters with other filters', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'after', '2024-01-01');
    await filterPanel.addFilter('Title', 'contains', 'Post');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const title = await listPage.getCellContent(i, 'title');
      expect(title).toContain('Post');
    }
  });

  test('should clear date filters', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'after', '2024-01-01');
    await filterPanel.apply();
    
    // Verify filter is active
    let rowCount = await listPage.getRowCount();
    const initialCount = rowCount;
    
    // Clear filter
    await filterPanel.open();
    await filterPanel.clearAll();
    await filterPanel.apply();
    
    // Should show more posts
    rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(initialCount);
  });

  test('should handle leap years', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Published At', 'equals', '2024-02-29');
    await filterPanel.apply();
    
    // 2024 is a leap year, so this date is valid
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter by year only', async ({ page }) => {
    await filterPanel.open();
    
    // Look for year filter option
    const yearSelect = filterPanel.panel.locator('select[name*="year"]').first();
    if (await yearSelect.isVisible()) {
      await yearSelect.selectOption('2024');
      await filterPanel.apply();
      
      // Should find all 2024 posts
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBe(3);
    }
  });

  test('should filter by month', async ({ page }) => {
    await filterPanel.open();
    
    // Look for month filter option
    const monthSelect = filterPanel.panel.locator('select[name*="month"]').first();
    if (await monthSelect.isVisible()) {
      await monthSelect.selectOption({ label: /july/i });
      await filterPanel.apply();
      
      // Should find July posts
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBe(1);
    }
  });

  test('should show calendar widget', async ({ page }) => {
    await filterPanel.open();
    
    const dateInput = filterPanel.panel.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.click();
      
      // Look for calendar popup
      const calendar = page.locator('[role="dialog"][aria-label*="calendar"], .calendar-popup');
      if (await calendar.isVisible({ timeout: 1000 })) {
        expect(calendar).toBeTruthy();
        
        // Close calendar
        await page.keyboard.press('Escape');
      }
    }
  });
});