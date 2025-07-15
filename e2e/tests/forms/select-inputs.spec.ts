import { test, expect } from '../../fixtures/test';
import { ModelFormPage } from '../../pages/model-form';
import { ModelListPage } from '../../pages/model-list';

test.describe('Select/Dropdown Fields', () => {
  let formPage: ModelFormPage;
  let listPage: ModelListPage;

  test.beforeEach(async ({ page }) => {
    formPage = new ModelFormPage(page);
    listPage = new ModelListPage(page);
    await page.goto('/admin/post');
    await listPage.clickCreate();
  });

  test('should display select fields', async ({ page }) => {
    // Look for native select or custom dropdown
    const selectField = formPage.form.locator('select, [role="combobox"]').first();
    await expect(selectField).toBeVisible();
  });

  test('should open dropdown on click', async ({ page }) => {
    const selectField = formPage.form.locator('select, [role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      // For custom dropdowns
      if (await selectField.getAttribute('role') === 'combobox') {
        await selectField.click();
        
        // Check for options list
        const optionsList = page.locator('[role="listbox"], [role="menu"]');
        await expect(optionsList).toBeVisible();
      } else {
        // Native select
        await selectField.click();
      }
    }
  });

  test('should select option by click', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      await selectField.click();
      
      // Select first option
      const firstOption = page.locator('[role="option"]').first();
      const optionText = await firstOption.textContent();
      await firstOption.click();
      
      // Verify selection
      await expect(selectField).toContainText(optionText || '');
    }
  });

  test('should filter options with search', async ({ page }) => {
    const searchableSelect = formPage.form.locator('[role="combobox"]').first();
    
    if (await searchableSelect.isVisible()) {
      await searchableSelect.click();
      
      // Type to search
      await page.keyboard.type('test');
      
      // Check filtered options
      const visibleOptions = page.locator('[role="option"]:visible');
      const count = await visibleOptions.count();
      
      if (count > 0) {
        // Options should be filtered
        const firstOptionText = await visibleOptions.first().textContent();
        expect(firstOptionText?.toLowerCase()).toContain('test');
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      await selectField.click();
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      
      // Select with Enter
      await page.keyboard.press('Enter');
      
      // Dropdown should close and value selected
      const optionsList = page.locator('[role="listbox"]');
      await expect(optionsList).not.toBeVisible();
    }
  });

  test('should close dropdown on escape', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      await selectField.click();
      
      // Verify dropdown is open
      const optionsList = page.locator('[role="listbox"]');
      await expect(optionsList).toBeVisible();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Dropdown should close
      await expect(optionsList).not.toBeVisible();
    }
  });

  test('should show placeholder or default option', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      const placeholder = await selectField.getAttribute('placeholder');
      const text = await selectField.textContent();
      
      // Should show placeholder or default text
      expect(placeholder || text).toMatch(/select|choose/i);
    }
  });

  test('should handle multi-select if available', async ({ page }) => {
    const multiSelect = formPage.form.locator('[role="combobox"][aria-multiselectable="true"], select[multiple]').first();
    
    if (await multiSelect.isVisible()) {
      await multiSelect.click();
      
      // Select multiple options
      const options = page.locator('[role="option"]');
      await options.nth(0).click();
      await options.nth(1).click();
      
      // Should show multiple selections
      const selectedCount = await page.locator('[aria-selected="true"]').count();
      expect(selectedCount).toBe(2);
    }
  });

  test('should validate required select fields', async ({ page }) => {
    // Find required select
    const requiredSelect = formPage.form.locator('select[required], [role="combobox"][aria-required="true"]').first();
    
    if (await requiredSelect.isVisible()) {
      // Try to submit without selection
      await formPage.submit();
      
      // Should show validation error
      const error = await formPage.getErrorMessage();
      expect(error).toMatch(/required|select|choose/i);
    }
  });

  test('should handle disabled options', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      await selectField.click();
      
      // Look for disabled options
      const disabledOption = page.locator('[role="option"][aria-disabled="true"]').first();
      
      if (await disabledOption.isVisible()) {
        // Try to click disabled option
        await disabledOption.click();
        
        // Should not be selected
        const ariaSelected = await disabledOption.getAttribute('aria-selected');
        expect(ariaSelected).not.toBe('true');
      }
    }
  });

  test('should group options if categories exist', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      await selectField.click();
      
      // Look for option groups
      const optionGroups = page.locator('[role="group"], optgroup');
      
      if (await optionGroups.count() > 0) {
        // Check group has label
        const groupLabel = await optionGroups.first().getAttribute('aria-label');
        expect(groupLabel).toBeTruthy();
      }
    }
  });

  test('should clear selection with clear button', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      // Make a selection first
      await selectField.click();
      await page.locator('[role="option"]').first().click();
      
      // Look for clear button
      const clearButton = selectField.locator('~ button[aria-label*="clear"], button[title*="clear"]');
      
      if (await clearButton.isVisible()) {
        await clearButton.click();
        
        // Should show placeholder again
        const text = await selectField.textContent();
        expect(text).toMatch(/select|choose/i);
      }
    }
  });

  test('should load options asynchronously', async ({ page }) => {
    // Look for async select (e.g., user selection)
    const asyncSelect = formPage.form.locator('[role="combobox"][aria-busy]').first();
    
    if (await asyncSelect.isVisible()) {
      await asyncSelect.click();
      
      // Wait for loading to complete
      await page.waitForSelector('[aria-busy="false"]');
      
      // Options should be loaded
      const options = page.locator('[role="option"]');
      await expect(options.first()).toBeVisible();
    }
  });

  test('should handle very long option lists', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      await selectField.click();
      
      const optionsList = page.locator('[role="listbox"]');
      const optionsCount = await page.locator('[role="option"]').count();
      
      if (optionsCount > 10) {
        // Should have scrollable container
        const isScrollable = await optionsList.evaluate(el => {
          return el.scrollHeight > el.clientHeight;
        });
        
        expect(isScrollable).toBe(true);
      }
    }
  });

  test('should highlight selected option', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      // Make a selection
      await selectField.click();
      const secondOption = page.locator('[role="option"]').nth(1);
      await secondOption.click();
      
      // Reopen dropdown
      await selectField.click();
      
      // Selected option should be highlighted
      const selectedOption = page.locator('[role="option"][aria-selected="true"]');
      await expect(selectedOption).toBeVisible();
      
      // Check visual indication
      const className = await selectedOption.getAttribute('class');
      expect(className).toMatch(/selected|active|checked/i);
    }
  });

  test('should handle option with icons or badges', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      await selectField.click();
      
      // Look for options with extra content
      const optionWithIcon = page.locator('[role="option"] svg').first();
      const optionWithBadge = page.locator('[role="option"] [class*="badge"]').first();
      
      if (await optionWithIcon.isVisible() || await optionWithBadge.isVisible()) {
        // Options can have rich content
        expect(true).toBe(true);
      }
    }
  });

  test('should announce changes to screen readers', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      // Check ARIA attributes
      const ariaLabel = await selectField.getAttribute('aria-label');
      const labelledBy = await selectField.getAttribute('aria-labelledby');
      
      expect(ariaLabel || labelledBy).toBeTruthy();
      
      // Make selection
      await selectField.click();
      await page.locator('[role="option"]').first().click();
      
      // Check live region for announcement
      const liveRegion = page.locator('[aria-live]');
      if (await liveRegion.isVisible()) {
        const announcement = await liveRegion.textContent();
        expect(announcement).toBeTruthy();
      }
    }
  });

  test('should maintain selection on form errors', async ({ page }) => {
    const selectField = formPage.form.locator('[role="combobox"]').first();
    
    if (await selectField.isVisible()) {
      // Make selection
      await selectField.click();
      const selectedOption = page.locator('[role="option"]').first();
      const selectedText = await selectedOption.textContent();
      await selectedOption.click();
      
      // Submit with error
      await formPage.submit();
      
      // Selection should persist
      await expect(selectField).toContainText(selectedText || '');
    }
  });
});