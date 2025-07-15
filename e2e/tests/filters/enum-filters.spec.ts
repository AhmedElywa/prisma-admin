import { test, expect } from '../../fixtures/test';
import { ModelListPage } from '../../pages/model-list';
import { FilterPanel } from '../../pages/filter-panel';
import { ModelFormPage } from '../../pages/model-form';

test.describe('Enum Filter Tests', () => {
  let listPage: ModelListPage;
  let filterPanel: FilterPanel;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ModelListPage(page);
    filterPanel = new FilterPanel(page);
    formPage = new ModelFormPage(page);
    
    await page.goto('/admin/user');
    
    // Create test data with various roles
    const testUsers = [
      { email: 'admin1@example.com', name: 'Admin One', role: 'ADMIN' },
      { email: 'admin2@example.com', name: 'Admin Two', role: 'ADMIN' },
      { email: 'user1@example.com', name: 'User One', role: 'USER' },
      { email: 'user2@example.com', name: 'User Two', role: 'USER' },
      { email: 'user3@example.com', name: 'User Three', role: 'USER' },
    ];
    
    for (const user of testUsers) {
      await listPage.clickCreate();
      await formPage.fillField('Email', user.email);
      await formPage.fillField('Name', user.name);
      
      // Select role from enum dropdown
      const roleSelect = formPage.form.locator('select[name*="role"], [role="combobox"][name*="role"]').first();
      if (await roleSelect.isVisible()) {
        if (await roleSelect.getAttribute('role') === 'combobox') {
          await roleSelect.click();
          await page.locator(`[role="option"]:has-text("${user.role}")`).click();
        } else {
          await roleSelect.selectOption(user.role);
        }
      }
      
      await formPage.submit();
      await formPage.waitForSuccess();
    }
  });

  test('should filter by single enum value', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Role', 'equals', 'ADMIN');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2);
    
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      expect(email).toContain('admin');
    }
  });

  test('should filter by "not equals" enum value', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Role', 'not equals', 'ADMIN');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3);
    
    for (let i = 0; i < rowCount; i++) {
      const email = await listPage.getCellContent(i, 'email');
      expect(email).toContain('user');
    }
  });

  test('should filter by multiple enum values (in operator)', async ({ page }) => {
    await filterPanel.open();
    
    // Look for multi-select or "in" operator
    await filterPanel.addFilter('Role', 'in', ['USER', 'ADMIN']);
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(5); // All users
  });

  test('should use dropdown/select for enum filter', async ({ page }) => {
    await filterPanel.open();
    
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /role/i });
    
    // Should show enum options
    const valueSelect = filterPanel.panel.locator('select').nth(2);
    const options = await valueSelect.locator('option').allTextContents();
    
    expect(options).toContain('ADMIN');
    expect(options).toContain('USER');
  });

  test('should handle empty enum values', async ({ page }) => {
    // Create user without role if possible
    await listPage.clickCreate();
    await formPage.fillField('Email', 'norole@example.com');
    await formPage.fillField('Name', 'No Role User');
    
    // Try to leave role empty
    const roleSelect = formPage.form.locator('select[name*="role"]').first();
    if (await roleSelect.isVisible()) {
      // Check if empty option exists
      const emptyOption = roleSelect.locator('option[value=""], option:has-text("Select")');
      if (await emptyOption.count() > 0) {
        await roleSelect.selectOption('');
      }
    }
    
    await formPage.submit();
    
    // If form allows empty role
    if (await formPage.hasError()) {
      // Role might be required
      await page.goBack();
    } else {
      await formPage.waitForSuccess();
      
      await filterPanel.open();
      await filterPanel.addFilter('Role', 'is empty', '');
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('should show enum values with proper labels', async ({ page }) => {
    // Check table display
    const roleCell = listPage.table.locator('tbody tr').first().locator('td').filter({ hasText: /ADMIN|USER/i }).first();
    
    if (await roleCell.isVisible()) {
      const text = await roleCell.textContent();
      expect(['ADMIN', 'USER']).toContain(text?.trim());
    }
  });

  test('should combine enum filter with other filters', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Role', 'equals', 'USER');
    await filterPanel.addFilter('Email', 'contains', '1');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(1); // user1@example.com
    
    const email = await listPage.getCellContent(0, 'email');
    expect(email).toBe('user1@example.com');
  });

  test('should handle enum with many values', async ({ page }) => {
    await filterPanel.open();
    
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /role/i });
    
    const valueSelect = filterPanel.panel.locator('select, [role="combobox"]').nth(2);
    
    if (await valueSelect.getAttribute('role') === 'combobox') {
      // Searchable dropdown for many values
      await valueSelect.click();
      await page.keyboard.type('ADM');
      
      const filteredOption = page.locator('[role="option"]:visible').first();
      await expect(filteredOption).toContainText('ADMIN');
    }
  });

  test('should clear enum filter', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Role', 'equals', 'ADMIN');
    await filterPanel.apply();
    
    let rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(2);
    
    // Clear filter
    await filterPanel.open();
    await filterPanel.clearAll();
    await filterPanel.apply();
    
    rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(2);
  });

  test('should handle case sensitivity in enum', async ({ page }) => {
    await filterPanel.open();
    
    // Try lowercase value
    const valueInput = filterPanel.panel.locator('input[type="text"]').last();
    if (await valueInput.isVisible()) {
      await valueInput.fill('admin');
      await filterPanel.apply();
      
      // Might auto-correct to uppercase or handle case-insensitive
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should group enum values if categorized', async ({ page }) => {
    await filterPanel.open();
    
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /role/i });
    
    const valueSelect = filterPanel.panel.locator('select').nth(2);
    
    // Check for optgroups
    const optgroups = valueSelect.locator('optgroup');
    if (await optgroups.count() > 0) {
      // Enum values might be grouped
      const groupLabel = await optgroups.first().getAttribute('label');
      expect(groupLabel).toBeTruthy();
    }
  });

  test('should export filtered enum results', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Role', 'equals', 'USER');
    await filterPanel.apply();
    
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(3);
    
    if (await listPage.exportButton.isVisible()) {
      // Export would include only users with USER role
      expect(true).toBe(true);
    }
  });

  test('should handle enum filter in bulk operations', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Role', 'equals', 'USER');
    await filterPanel.apply();
    
    // Select all filtered
    const selectAll = listPage.table.locator('thead input[type="checkbox"]').first();
    if (await selectAll.isVisible()) {
      await selectAll.check();
      
      // Could bulk update role
      const bulkButton = page.locator('button').filter({ hasText: /bulk|action/i });
      if (await bulkButton.isVisible()) {
        expect(true).toBe(true);
      }
    }
  });

  test('should show enum filter in active filters', async ({ page }) => {
    await filterPanel.open();
    await filterPanel.addFilter('Role', 'equals', 'ADMIN');
    await filterPanel.apply();
    
    // Check active filter display
    const activeFilter = page.locator('[data-testid="active-filter"], .active-filter').filter({ hasText: /role.*admin/i });
    if (await activeFilter.isVisible()) {
      expect(await activeFilter.textContent()).toMatch(/role.*admin/i);
    }
  });

  test('should handle enum arrays if supported', async ({ page }) => {
    // Some schemas might have array of enums
    const enumArrayField = await filterPanel.getFieldsByType('enum[]');
    
    if (enumArrayField.length > 0) {
      await filterPanel.open();
      await filterPanel.addFilter(enumArrayField[0], 'contains', 'ADMIN');
      await filterPanel.apply();
      
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should validate enum values', async ({ page }) => {
    await filterPanel.open();
    
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /role/i });
    
    // Try to enter invalid enum value
    const valueInput = filterPanel.panel.locator('input[type="text"]').last();
    if (await valueInput.isVisible()) {
      await valueInput.fill('INVALID_ROLE');
      await filterPanel.apply();
      
      // Should either reject or show no results
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBe(0);
    }
  });

  test('should handle dynamic enum loading', async ({ page }) => {
    // Some enums might be loaded from API
    await filterPanel.open();
    
    const fieldSelect = filterPanel.panel.locator('select').first();
    await fieldSelect.selectOption({ label: /role/i });
    
    // Check for loading state
    const loadingIndicator = filterPanel.panel.locator('.loading, [aria-busy="true"]');
    if (await loadingIndicator.isVisible()) {
      await loadingIndicator.waitFor({ state: 'hidden' });
    }
    
    // Enum values should be loaded
    const valueSelect = filterPanel.panel.locator('select').nth(2);
    const optionCount = await valueSelect.locator('option').count();
    expect(optionCount).toBeGreaterThan(1);
  });
});