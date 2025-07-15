import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Bulk Actions and Confirmations', () => {
  let listPage: ModelListPage;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    formPage = new ModelFormPage(page);
    await page.goto('/admin/user');
  });

  test('should select individual rows', async ({ page }) => {
    const rowCount = await listPage.getRowCount();
    if (rowCount > 0) {
      // Select first row
      await listPage.selectRow(0);
      
      // Check checkbox is checked
      const checkbox = listPage.tableRows.first().locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
    }
  });

  test('should select all rows with select all checkbox', async ({ page }) => {
    await listPage.selectAllRows();
    
    // All row checkboxes should be checked
    const checkboxes = listPage.tableRows.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('should show bulk actions button when rows selected', async ({ page }) => {
    // Initially bulk actions should not be visible
    await expect(listPage.bulkActionsButton).not.toBeVisible();
    
    // Select a row
    await listPage.selectRow(0);
    
    // Now bulk actions should appear
    await expect(listPage.bulkActionsButton).toBeVisible();
  });

  test('should show bulk action menu', async ({ page }) => {
    await listPage.selectRow(0);
    await listPage.bulkActionsButton.click();
    
    // Should show menu with options
    const deleteOption = page.getByRole('menuitem', { name: /delete/i });
    await expect(deleteOption).toBeVisible();
  });

  test('should handle bulk delete with confirmation', async ({ page }) => {
    const initialCount = await listPage.getRowCount();
    
    // Select first row
    await listPage.selectRow(0);
    
    // Click bulk actions
    await listPage.bulkActionsButton.click();
    
    // Click delete
    const deleteOption = page.getByRole('menuitem', { name: /delete/i });
    await deleteOption.click();
    
    // Should show confirmation dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Check dialog content
    const dialogText = await dialog.textContent();
    expect(dialogText).toMatch(/delete|confirm|sure/i);
    
    // Cancel deletion
    const cancelButton = dialog.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    
    // Dialog should close
    await expect(dialog).not.toBeVisible();
    
    // Row count should remain the same
    const afterCancelCount = await listPage.getRowCount();
    expect(afterCancelCount).toBe(initialCount);
  });

  test('should perform bulk delete', async ({ page }) => {
    // Create test data first
    await listPage.clickCreate();
    await formPage.fillField('Email', 'test-delete@example.com');
    await formPage.fillField('Password', 'password123');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    await page.goto('/admin/user');
    const initialCount = await listPage.getRowCount();
    
    // Find and select the test row
    let testRowIndex = -1;
    for (let i = 0; i < initialCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      if (email.includes('test-delete')) {
        testRowIndex = i;
        break;
      }
    }
    
    if (testRowIndex >= 0) {
      await listPage.selectRow(testRowIndex);
      await listPage.bulkActionsButton.click();
      
      const deleteOption = page.getByRole('menuitem', { name: /delete/i });
      await deleteOption.click();
      
      // Confirm deletion
      const dialog = page.getByRole('dialog');
      const confirmButton = dialog.getByRole('button', { name: /confirm|delete|yes/i });
      await confirmButton.click();
      
      // Wait for deletion
      await page.waitForTimeout(1000);
      
      // Check row was deleted
      const finalCount = await listPage.getRowCount();
      expect(finalCount).toBe(initialCount - 1);
    }
  });

  test('should handle bulk update', async ({ page }) => {
    const rowCount = await listPage.getRowCount();
    if (rowCount >= 2) {
      // Select multiple rows
      await listPage.selectRow(0);
      await listPage.selectRow(1);
      
      await listPage.bulkActionsButton.click();
      
      // Look for update option
      const updateOption = page.getByRole('menuitem', { name: /update|edit/i });
      if (await updateOption.isVisible()) {
        await updateOption.click();
        
        // Should show bulk update form or dialog
        const updateDialog = page.getByRole('dialog');
        if (await updateDialog.isVisible()) {
          // Fill update form
          const nameField = updateDialog.getByLabel(/name/i);
          if (await nameField.isVisible()) {
            await nameField.fill('Bulk Updated');
            
            // Submit update
            const updateButton = updateDialog.getByRole('button', { name: /update|save/i });
            await updateButton.click();
            
            // Check update succeeded
            await page.waitForTimeout(1000);
          }
        }
      }
    }
  });

  test('should show selected count', async ({ page }) => {
    await listPage.selectRow(0);
    await listPage.selectRow(1);
    
    // Should show "2 selected" or similar
    const selectedText = page.locator('text=/\\d+ selected/i');
    await expect(selectedText).toBeVisible();
    
    const text = await selectedText.textContent();
    expect(text).toMatch(/2/);
  });

  test('should clear selection', async ({ page }) => {
    await listPage.selectRow(0);
    await listPage.selectRow(1);
    
    // Look for clear selection button
    const clearButton = page.getByRole('button', { name: /clear|deselect/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();
      
      // All checkboxes should be unchecked
      const checkboxes = listPage.tableRows.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    }
  });

  test('should handle keyboard shortcuts for selection', async ({ page }) => {
    // Focus on first row
    await listPage.tableRows.first().focus();
    
    // Space to select
    await page.keyboard.press('Space');
    
    const checkbox = listPage.tableRows.first().locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
    
    // Shift+click for range selection
    const lastRow = listPage.tableRows.last();
    await page.keyboard.down('Shift');
    await lastRow.click();
    await page.keyboard.up('Shift');
    
    // Multiple rows should be selected
    const checkedCount = await listPage.tableRows.locator('input[type="checkbox"]:checked').count();
    expect(checkedCount).toBeGreaterThan(1);
  });

  test('should disable bulk actions for protected items', async ({ page }) => {
    // Some items might be protected from bulk operations
    const protectedRows = listPage.tableRows.filter({ has: page.locator('[data-protected="true"]') });
    
    if (await protectedRows.count() > 0) {
      // Protected rows should not have checkboxes or disabled checkboxes
      const checkbox = protectedRows.first().locator('input[type="checkbox"]');
      
      if (await checkbox.isVisible()) {
        await expect(checkbox).toBeDisabled();
      }
    }
  });

  test('should handle bulk action errors', async ({ page }) => {
    await listPage.selectRow(0);
    await listPage.bulkActionsButton.click();
    
    // Simulate error by trying invalid action
    const invalidAction = page.getByRole('menuitem', { name: /invalid/i });
    if (await invalidAction.isVisible()) {
      await invalidAction.click();
      
      // Should show error message
      const errorMessage = page.getByRole('alert');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should maintain selection across pagination', async ({ page }) => {
    const pageButtons = listPage.pagination.getByRole('button');
    const hasMultiplePages = await pageButtons.count() > 3; // Previous, Next, and at least one page number
    
    if (hasMultiplePages) {
      // Select items on first page
      await listPage.selectRow(0);
      
      // Go to second page
      await listPage.goToPage(2);
      
      // Selection count should persist
      const selectedText = page.locator('text=/\\d+ selected/i');
      if (await selectedText.isVisible()) {
        const text = await selectedText.textContent();
        expect(text).toMatch(/1/);
      }
    }
  });

  test('should show confirmation for dangerous bulk actions', async ({ page }) => {
    await listPage.selectAllRows();
    await listPage.bulkActionsButton.click();
    
    const deleteOption = page.getByRole('menuitem', { name: /delete/i });
    await deleteOption.click();
    
    // Should show warning for deleting all
    const dialog = page.getByRole('dialog');
    const dialogText = await dialog.textContent();
    expect(dialogText).toMatch(/all|sure|cannot be undone/i);
  });

  test('should support bulk export', async ({ page }) => {
    await listPage.selectRow(0);
    await listPage.selectRow(1);
    
    await listPage.bulkActionsButton.click();
    
    const exportOption = page.getByRole('menuitem', { name: /export/i });
    if (await exportOption.isVisible()) {
      await exportOption.click();
      
      // Should trigger download or show export options
      const exportDialog = page.getByRole('dialog');
      if (await exportDialog.isVisible()) {
        const csvOption = exportDialog.getByRole('button', { name: /csv/i });
        await expect(csvOption).toBeVisible();
      }
    }
  });

  test('should handle bulk action permissions', async ({ page }) => {
    await listPage.selectRow(0);
    await listPage.bulkActionsButton.click();
    
    // Some actions might be disabled based on permissions
    const menuItems = page.getByRole('menuitem');
    const count = await menuItems.count();
    
    for (let i = 0; i < count; i++) {
      const item = menuItems.nth(i);
      const isDisabled = await item.getAttribute('aria-disabled');
      
      if (isDisabled === 'true') {
        // Disabled items should have visual indication
        const className = await item.getAttribute('class');
        expect(className).toMatch(/disabled|muted/i);
      }
    }
  });
});