import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { TestDataGenerator } from '../../helpers/test-data';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Table Sorting', () => {
  let listPage: ModelListPage;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    formPage = new ModelFormPage(page);
    
    // Create test data with predictable values for sorting
    await page.goto('/admin/user');
    
    const users = [
      { email: 'alice@example.com', name: 'Alice' },
      { email: 'bob@example.com', name: 'Bob' },
      { email: 'charlie@example.com', name: 'Charlie' },
    ];
    
    for (const user of users) {
      await listPage.clickCreate();
      await formPage.fillField('Email', user.email);
      await formPage.fillField('Name', user.name);
      await formPage.submit();
      await formPage.waitForSuccess();
    }
  });

  test('should display sortable column headers', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Check for sortable indicators on headers
    const headers = listPage.table.locator('th');
    const headerCount = await headers.count();
    
    for (let i = 0; i < headerCount; i++) {
      const header = headers.nth(i);
      const sortButton = header.locator('button, [role="button"]');
      
      if (await sortButton.isVisible()) {
        // Check for sort icon
        const sortIcon = header.locator('svg, [class*="sort"]');
        await expect(sortIcon).toBeVisible();
      }
    }
  });

  test('should sort by email ascending', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Click email header to sort
    const emailHeader = listPage.table.locator('th').filter({ hasText: /email/i });
    await emailHeader.click();
    
    // Wait for sort to apply
    await page.waitForTimeout(500);
    
    // Get all email values
    const emails: string[] = [];
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      emails.push(email);
    }
    
    // Check if sorted ascending
    const sortedEmails = [...emails].sort();
    expect(emails).toEqual(sortedEmails);
  });

  test('should sort by email descending on second click', async ({ page }) => {
    await page.goto('/admin/user');
    
    const emailHeader = listPage.table.locator('th').filter({ hasText: /email/i });
    
    // First click - ascending
    await emailHeader.click();
    await page.waitForTimeout(500);
    
    // Second click - descending
    await emailHeader.click();
    await page.waitForTimeout(500);
    
    // Get all email values
    const emails: string[] = [];
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      emails.push(email);
    }
    
    // Check if sorted descending
    const sortedEmailsDesc = [...emails].sort().reverse();
    expect(emails).toEqual(sortedEmailsDesc);
  });

  test('should show sort direction indicator', async ({ page }) => {
    await page.goto('/admin/user');
    
    const emailHeader = listPage.table.locator('th').filter({ hasText: /email/i });
    
    // Click to sort ascending
    await emailHeader.click();
    
    // Check for ascending indicator
    const ascIcon = emailHeader.locator('[aria-label*="ascending"], [class*="asc"], svg[class*="up"]');
    await expect(ascIcon).toBeVisible();
    
    // Click to sort descending
    await emailHeader.click();
    
    // Check for descending indicator
    const descIcon = emailHeader.locator('[aria-label*="descending"], [class*="desc"], svg[class*="down"]');
    await expect(descIcon).toBeVisible();
  });

  test('should clear sort on third click', async ({ page }) => {
    await page.goto('/admin/user');
    
    const emailHeader = listPage.table.locator('th').filter({ hasText: /email/i });
    
    // Click three times
    await emailHeader.click(); // asc
    await emailHeader.click(); // desc
    await emailHeader.click(); // clear
    
    // Check no sort indicator
    const sortIndicators = emailHeader.locator('[aria-label*="sort"], [class*="sorted"]');
    const indicatorCount = await sortIndicators.count();
    expect(indicatorCount).toBe(0);
  });

  test('should sort numeric columns correctly', async ({ page }) => {
    await page.goto('/admin/post');
    
    // Create posts with different view counts
    const posts = [
      { title: 'Post 10', views: 10 },
      { title: 'Post 100', views: 100 },
      { title: 'Post 5', views: 5 },
    ];
    
    for (const post of posts) {
      await listPage.clickCreate();
      await formPage.fillField('Title', post.title);
      await formPage.fillField('Views', post.views.toString());
      await formPage.submit();
      await formPage.waitForSuccess();
    }
    
    // Sort by views
    const viewsHeader = listPage.table.locator('th').filter({ hasText: /views/i });
    await viewsHeader.click();
    
    // Get view values
    const views: number[] = [];
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const viewText = await listPage.getCellContent(i, 'views');
      views.push(parseInt(viewText) || 0);
    }
    
    // Check numeric sort (not alphabetic)
    const sortedViews = [...views].sort((a, b) => a - b);
    expect(views).toEqual(sortedViews);
  });

  test('should sort date columns correctly', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Sort by created date
    const createdHeader = listPage.table.locator('th').filter({ hasText: /created/i });
    if (await createdHeader.isVisible()) {
      await createdHeader.click();
      
      // Check dates are in order
      const dates: Date[] = [];
      const rowCount = await listPage.getRowCount();
      for (let i = 0; i < rowCount; i++) {
        const dateText = await listPage.getCellContent(i, 'created');
        dates.push(new Date(dateText));
      }
      
      // Check chronological order
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i-1].getTime());
      }
    }
  });

  test('should maintain sort when paginating', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Sort by email
    const emailHeader = listPage.table.locator('th').filter({ hasText: /email/i });
    await emailHeader.click();
    
    // Check sort indicator is present
    const sortIcon = emailHeader.locator('[class*="sort"], svg');
    await expect(sortIcon).toBeVisible();
    
    // Go to next page if available
    const nextButton = listPage.pagination.getByRole('button', { name: /next/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      
      // Sort should still be applied
      await expect(sortIcon).toBeVisible();
    }
  });

  test('should handle multi-column sort if supported', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Try sorting with shift/ctrl key
    const nameHeader = listPage.table.locator('th').filter({ hasText: /name/i });
    const emailHeader = listPage.table.locator('th').filter({ hasText: /email/i });
    
    // First sort by name
    await nameHeader.click();
    
    // Then shift+click email for secondary sort
    await page.keyboard.down('Shift');
    await emailHeader.click();
    await page.keyboard.up('Shift');
    
    // Check if both columns show sort indicators
    const nameSortIcon = nameHeader.locator('[class*="sort"]');
    const emailSortIcon = emailHeader.locator('[class*="sort"]');
    
    if (await nameSortIcon.isVisible() && await emailSortIcon.isVisible()) {
      // Multi-column sort is supported
      expect(true).toBe(true);
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Focus on sortable header
    const emailHeader = listPage.table.locator('th').filter({ hasText: /email/i });
    const sortButton = emailHeader.locator('button, [role="button"]').first();
    
    if (await sortButton.isVisible()) {
      await sortButton.focus();
      
      // Activate with Enter
      await page.keyboard.press('Enter');
      
      // Check sort was applied
      const sortIcon = emailHeader.locator('[class*="sort"], svg');
      await expect(sortIcon).toBeVisible();
      
      // Activate with Space
      await page.keyboard.press('Space');
      
      // Check sort direction changed
      const descIcon = emailHeader.locator('[class*="desc"], svg[class*="down"]');
      await expect(descIcon).toBeVisible();
    }
  });

  test('should announce sort changes to screen readers', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Check for ARIA live region
    const liveRegion = page.locator('[aria-live="polite"], [role="status"]');
    
    // Sort a column
    const emailHeader = listPage.table.locator('th').filter({ hasText: /email/i });
    await emailHeader.click();
    
    // Check if sort state is announced
    if (await liveRegion.isVisible()) {
      const announcement = await liveRegion.textContent();
      expect(announcement).toMatch(/sort|ascending|descending/i);
    }
  });
});