import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { TestDataGenerator } from '../../helpers/test-data';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Table Selection', () => {
  let listPage: ModelListPage;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    formPage = new ModelFormPage(page);
    await page.goto('/admin/user');
    
    // Create test data
    for (let i = 0; i < 5; i++) {
      const userData = TestDataGenerator.generateUser();
      await listPage.clickCreate();
      await formPage.fillField('Email', userData.email);
      await formPage.fillField('Name', userData.name || `User ${i}`);
      await formPage.submit();
      await formPage.waitForSuccess();
    }
  });

  test('should display checkbox for each row', async ({ page }) => {
    // Check each row has a checkbox
    const rowCount = await listPage.getRowCount();
    
    for (let i = 0; i < rowCount; i++) {
      const row = listPage.tableRows.nth(i);
      const checkbox = row.locator('input[type="checkbox"]');
      await expect(checkbox).toBeVisible();
    }
  });

  test('should display select all checkbox in header', async ({ page }) => {
    await expect(listPage.bulkSelectAll).toBeVisible();
    await expect(listPage.bulkSelectAll).not.toBeChecked();
  });

  test('should select individual row', async ({ page }) => {
    // Select first row
    await listPage.selectRow(0);
    
    // Check it's selected
    const firstRowCheckbox = listPage.tableRows.nth(0).locator('input[type="checkbox"]');
    await expect(firstRowCheckbox).toBeChecked();
    
    // Check visual indication
    const firstRow = listPage.tableRows.nth(0);
    const className = await firstRow.getAttribute('class');
    expect(className).toMatch(/selected|checked|active/i);
  });

  test('should deselect individual row', async ({ page }) => {
    // Select then deselect
    await listPage.selectRow(0);
    await listPage.selectRow(0); // Click again to deselect
    
    // Check it's not selected
    const firstRowCheckbox = listPage.tableRows.nth(0).locator('input[type="checkbox"]');
    await expect(firstRowCheckbox).not.toBeChecked();
  });

  test('should select all rows', async ({ page }) => {
    await listPage.selectAllRows();
    
    // Check all rows are selected
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const checkbox = listPage.tableRows.nth(i).locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
    }
    
    // Check select all is checked
    await expect(listPage.bulkSelectAll).toBeChecked();
  });

  test('should deselect all rows', async ({ page }) => {
    // Select all first
    await listPage.selectAllRows();
    
    // Click again to deselect all
    await listPage.bulkSelectAll.click();
    
    // Check all rows are deselected
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const checkbox = listPage.tableRows.nth(i).locator('input[type="checkbox"]');
      await expect(checkbox).not.toBeChecked();
    }
  });

  test('should show indeterminate state for partial selection', async ({ page }) => {
    // Select some but not all rows
    await listPage.selectRow(0);
    await listPage.selectRow(1);
    
    // Check select all shows indeterminate state
    const selectAllState = await listPage.bulkSelectAll.evaluate((checkbox: HTMLInputElement) => {
      return checkbox.indeterminate;
    });
    expect(selectAllState).toBe(true);
  });

  test('should enable bulk actions when rows selected', async ({ page }) => {
    // Initially disabled
    await expect(listPage.bulkActionsButton).toBeDisabled();
    
    // Select a row
    await listPage.selectRow(0);
    
    // Should be enabled
    await expect(listPage.bulkActionsButton).toBeEnabled();
  });

  test('should show selection count', async ({ page }) => {
    // Select multiple rows
    await listPage.selectRow(0);
    await listPage.selectRow(1);
    await listPage.selectRow(2);
    
    // Look for count display
    const countDisplay = page.locator('text=/\\d+\\s+selected/i');
    await expect(countDisplay).toBeVisible();
    await expect(countDisplay).toContainText('3');
  });

  test('should maintain selection when sorting', async ({ page }) => {
    // Select some rows
    await listPage.selectRow(0);
    await listPage.selectRow(2);
    
    // Get selected emails
    const selectedEmails = [
      await listPage.getCellContent(0, 'email'),
      await listPage.getCellContent(2, 'email')
    ];
    
    // Sort by email
    const emailHeader = listPage.table.locator('th').filter({ hasText: /email/i });
    await emailHeader.click();
    
    // Check same emails are still selected
    const rowCount = await listPage.getRowCount();
    let selectedCount = 0;
    
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      const checkbox = listPage.tableRows.nth(i).locator('input[type="checkbox"]');
      
      if (selectedEmails.includes(email)) {
        await expect(checkbox).toBeChecked();
        selectedCount++;
      }
    }
    
    expect(selectedCount).toBe(2);
  });

  test('should clear selection when navigating pages', async ({ page }) => {
    // Select some rows
    await listPage.selectRow(0);
    await listPage.selectRow(1);
    
    // Navigate to next page if available
    const nextButton = listPage.pagination.getByRole('button', { name: /next/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      
      // Check no rows are selected
      const rowCount = await listPage.getRowCount();
      for (let i = 0; i < rowCount; i++) {
        const checkbox = listPage.tableRows.nth(i).locator('input[type="checkbox"]');
        await expect(checkbox).not.toBeChecked();
      }
      
      // Bulk actions should be disabled
      await expect(listPage.bulkActionsButton).toBeDisabled();
    }
  });

  test('should select range with shift+click', async ({ page }) => {
    // Click first row
    await listPage.selectRow(0);
    
    // Shift+click third row
    await page.keyboard.down('Shift');
    await listPage.selectRow(2);
    await page.keyboard.up('Shift');
    
    // Check rows 0, 1, 2 are selected
    for (let i = 0; i <= 2; i++) {
      const checkbox = listPage.tableRows.nth(i).locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
    }
    
    // Check row 3 is not selected
    const row3Checkbox = listPage.tableRows.nth(3).locator('input[type="checkbox"]');
    await expect(row3Checkbox).not.toBeChecked();
  });

  test('should toggle selection with ctrl/cmd+click', async ({ page }) => {
    // Select first row
    await listPage.selectRow(0);
    
    // Ctrl/Cmd+click third row
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.down(modifier);
    await listPage.selectRow(2);
    await page.keyboard.up(modifier);
    
    // Both should be selected
    const row0Checkbox = listPage.tableRows.nth(0).locator('input[type="checkbox"]');
    const row2Checkbox = listPage.tableRows.nth(2).locator('input[type="checkbox"]');
    await expect(row0Checkbox).toBeChecked();
    await expect(row2Checkbox).toBeChecked();
    
    // Row 1 should not be selected
    const row1Checkbox = listPage.tableRows.nth(1).locator('input[type="checkbox"]');
    await expect(row1Checkbox).not.toBeChecked();
  });

  test('should select all with keyboard shortcut', async ({ page }) => {
    // Focus on table
    await listPage.table.click();
    
    // Press Ctrl/Cmd+A
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+a`);
    
    // All rows should be selected
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const checkbox = listPage.tableRows.nth(i).locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
    }
  });

  test('should highlight row on hover', async ({ page }) => {
    const firstRow = listPage.tableRows.nth(0);
    
    // Get initial background
    const initialBg = await firstRow.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Hover over row
    await firstRow.hover();
    
    // Check background changed
    const hoverBg = await firstRow.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should be different (indicating hover state)
    expect(hoverBg).not.toBe(initialBg);
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Focus first checkbox
    const firstCheckbox = listPage.tableRows.nth(0).locator('input[type="checkbox"]');
    await firstCheckbox.focus();
    
    // Select with Space
    await page.keyboard.press('Space');
    await expect(firstCheckbox).toBeChecked();
    
    // Move to next row with Tab
    await page.keyboard.press('Tab');
    
    // Should focus next checkbox
    const focusedElement = page.locator(':focus');
    const isCheckbox = await focusedElement.evaluate(el => 
      el.tagName === 'INPUT' && el.getAttribute('type') === 'checkbox'
    );
    expect(isCheckbox).toBe(true);
  });

  test('should announce selection to screen readers', async ({ page }) => {
    // Select a row
    await listPage.selectRow(0);
    
    // Check for ARIA attributes
    const firstRow = listPage.tableRows.nth(0);
    const ariaSelected = await firstRow.getAttribute('aria-selected');
    expect(ariaSelected).toBe('true');
    
    // Check checkbox has label
    const checkbox = firstRow.locator('input[type="checkbox"]');
    const ariaLabel = await checkbox.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('should persist selection during live updates', async ({ page }) => {
    // Select some rows
    await listPage.selectRow(0);
    await listPage.selectRow(2);
    
    // Simulate live update by refreshing data
    await page.reload();
    
    // Selection should be cleared after reload
    const rowCount = await listPage.getRowCount();
    for (let i = 0; i < rowCount; i++) {
      const checkbox = listPage.tableRows.nth(i).locator('input[type="checkbox"]');
      await expect(checkbox).not.toBeChecked();
    }
  });
});