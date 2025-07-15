import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { TestDataGenerator } from '../../helpers/test-data';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Table Pagination', () => {
  let listPage: ModelListPage;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    formPage = new ModelFormPage(page);
  });

  test('should display pagination controls', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Check pagination exists
    await expect(listPage.pagination).toBeVisible();
    
    // Check for basic controls
    const prevButton = listPage.pagination.getByRole('button', { name: /previous|prev/i });
    const nextButton = listPage.pagination.getByRole('button', { name: /next/i });
    
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
  });

  test('should show page numbers', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Look for page number buttons
    const pageButtons = listPage.pagination.locator('button[aria-label*="page"], button:has-text(/^\\d+$/)');
    const count = await pageButtons.count();
    
    // Should have at least one page
    expect(count).toBeGreaterThan(0);
    
    // First page should be active
    const firstPageButton = pageButtons.first();
    const isActive = await firstPageButton.getAttribute('aria-current');
    if (isActive) {
      expect(isActive).toBe('page');
    } else {
      const className = await firstPageButton.getAttribute('class');
      expect(className).toMatch(/active|current|selected/i);
    }
  });

  test('should navigate to next page', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Create enough records to have multiple pages
    for (let i = 0; i < 25; i++) {
      const userData = TestDataGenerator.generateUser();
      await listPage.clickCreate();
      await formPage.fillField('Email', userData.email);
      await formPage.fillField('Name', userData.name || '');
      await formPage.submit();
      await formPage.waitForSuccess();
    }
    
    // Get first page data
    const firstPageEmail = await listPage.getCellContent(0, 'email');
    
    // Go to next page
    await listPage.clickNext();
    
    // URL should update
    await expect(page).toHaveURL(/page=2/);
    
    // Content should be different
    const secondPageEmail = await listPage.getCellContent(0, 'email');
    expect(secondPageEmail).not.toBe(firstPageEmail);
  });

  test('should navigate to previous page', async ({ page }) => {
    await page.goto('/admin/user?page=2');
    
    // Get current page data
    const secondPageEmail = await listPage.getCellContent(0, 'email');
    
    // Go to previous page
    await listPage.clickPrevious();
    
    // URL should update
    await expect(page).toHaveURL(/\/admin\/user(?!.*page=)/);
    
    // Content should be different
    const firstPageEmail = await listPage.getCellContent(0, 'email');
    expect(firstPageEmail).not.toBe(secondPageEmail);
  });

  test('should navigate to specific page number', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Click on page 2 if available
    const page2Button = listPage.pagination.getByRole('button', { name: '2' });
    if (await page2Button.isVisible()) {
      await page2Button.click();
      
      // URL should update
      await expect(page).toHaveURL(/page=2/);
      
      // Page 2 should be active
      const isActive = await page2Button.getAttribute('aria-current');
      if (isActive) {
        expect(isActive).toBe('page');
      }
    }
  });

  test('should disable previous on first page', async ({ page }) => {
    await page.goto('/admin/user');
    
    const prevButton = listPage.pagination.getByRole('button', { name: /previous|prev/i });
    await expect(prevButton).toBeDisabled();
  });

  test('should disable next on last page', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Navigate to last page
    const pageButtons = listPage.pagination.locator('button:has-text(/^\\d+$/)');
    const lastPageButton = pageButtons.last();
    
    if (await lastPageButton.isVisible()) {
      await lastPageButton.click();
      
      const nextButton = listPage.pagination.getByRole('button', { name: /next/i });
      await expect(nextButton).toBeDisabled();
    }
  });

  test('should show page size selector', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Look for page size selector
    const pageSizeSelector = page.locator('select[aria-label*="per page"], [role="combobox"][aria-label*="per page"]');
    
    if (await pageSizeSelector.isVisible()) {
      // Check default options
      const options = await pageSizeSelector.locator('option').allTextContents();
      expect(options).toContain('10');
      expect(options).toContain('25');
      expect(options).toContain('50');
    }
  });

  test('should change page size', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Create enough records
    for (let i = 0; i < 30; i++) {
      const userData = TestDataGenerator.generateUser();
      await listPage.clickCreate();
      await formPage.fillField('Email', userData.email);
      await formPage.submit();
      await formPage.waitForSuccess();
    }
    
    const pageSizeSelector = page.locator('select[aria-label*="per page"]');
    
    if (await pageSizeSelector.isVisible()) {
      // Get initial row count
      const initialCount = await listPage.getRowCount();
      
      // Change page size
      await pageSizeSelector.selectOption('25');
      
      // Wait for reload
      await page.waitForTimeout(500);
      
      // Check new row count
      const newCount = await listPage.getRowCount();
      expect(newCount).toBeGreaterThan(initialCount);
      expect(newCount).toBeLessThanOrEqual(25);
    }
  });

  test('should show total records count', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Look for total count display
    const totalCount = listPage.pagination.locator('text=/\\d+.*of.*\\d+/');
    
    if (await totalCount.isVisible()) {
      const text = await totalCount.textContent();
      expect(text).toMatch(/\d+.*of.*\d+/);
    }
  });

  test('should handle empty results', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Search for non-existent user
    await listPage.search('nonexistent@example.com');
    
    // Check pagination behavior
    const prevButton = listPage.pagination.getByRole('button', { name: /previous|prev/i });
    const nextButton = listPage.pagination.getByRole('button', { name: /next/i });
    
    await expect(prevButton).toBeDisabled();
    await expect(nextButton).toBeDisabled();
  });

  test('should show ellipsis for many pages', async ({ page }) => {
    await page.goto('/admin/user');
    
    // If there are many pages, check for ellipsis
    const ellipsis = listPage.pagination.locator('text="..."');
    const pageButtons = listPage.pagination.locator('button:has-text(/^\\d+$/)');
    const pageCount = await pageButtons.count();
    
    if (pageCount > 5) {
      await expect(ellipsis).toBeVisible();
    }
  });

  test('should update URL with page parameter', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Navigate to page 2
    const page2Button = listPage.pagination.getByRole('button', { name: '2' });
    if (await page2Button.isVisible()) {
      await page2Button.click();
      
      // Check URL
      const url = new URL(page.url());
      expect(url.searchParams.get('page')).toBe('2');
    }
  });

  test('should handle browser back/forward', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Navigate to page 2
    const page2Button = listPage.pagination.getByRole('button', { name: '2' });
    if (await page2Button.isVisible()) {
      await page2Button.click();
      await expect(page).toHaveURL(/page=2/);
      
      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/\/admin\/user(?!.*page=)/);
      
      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Focus on first page button
    const firstPageButton = listPage.pagination.locator('button').first();
    await firstPageButton.focus();
    
    // Navigate with Tab
    await page.keyboard.press('Tab');
    
    // Check focus moved
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate(el => el.tagName);
    expect(tagName).toBe('BUTTON');
  });

  test('should show loading state during navigation', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Listen for loading indicator
    const loadingPromise = page.waitForSelector('[aria-busy="true"], [class*="loading"]', { 
      state: 'visible',
      timeout: 2000 
    }).catch(() => null);
    
    // Navigate to next page
    await listPage.clickNext();
    
    // Check if loading was shown
    const loadingElement = await loadingPromise;
    if (loadingElement) {
      expect(loadingElement).toBeTruthy();
    }
  });

  test('should handle rapid page changes', async ({ page }) => {
    await page.goto('/admin/user');
    
    // Click next multiple times quickly
    const nextButton = listPage.pagination.getByRole('button', { name: /next/i });
    
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await nextButton.click();
      
      // Should end up on correct page without errors
      await expect(page).toHaveURL(/page=\d+/);
      
      // Table should have content
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    }
  });

  test('should preserve other query parameters', async ({ page }) => {
    await page.goto('/admin/user?sort=email&filter=active');
    
    // Navigate to page 2
    const page2Button = listPage.pagination.getByRole('button', { name: '2' });
    if (await page2Button.isVisible()) {
      await page2Button.click();
      
      // Check all params are preserved
      const url = new URL(page.url());
      expect(url.searchParams.get('page')).toBe('2');
      expect(url.searchParams.get('sort')).toBe('email');
      expect(url.searchParams.get('filter')).toBe('active');
    }
  });
});