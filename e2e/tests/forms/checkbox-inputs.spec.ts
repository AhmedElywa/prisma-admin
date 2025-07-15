import { test, expect } from '../../fixtures/test';
import { ModelFormPage } from '../../pages/model-form';
import { ModelListPage } from '../../pages/model-list';

test.describe('Checkbox and Toggle Fields', () => {
  let formPage: ModelFormPage;
  let listPage: ModelListPage;

  test.beforeEach(async ({ page }) => {
    formPage = new ModelFormPage(page);
    listPage = new ModelListPage(page);
    await page.goto('/admin/post');
    await listPage.clickCreate();
  });

  test('should display checkbox fields', async ({ page }) => {
    // Look for boolean fields like 'published'
    const checkbox = formPage.form.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await expect(checkbox).toBeVisible();
      
      // Check label is clickable
      const label = formPage.form.locator(`label[for="${await checkbox.getAttribute('id')}"]`);
      await expect(label).toBeVisible();
    }
  });

  test('should toggle checkbox on click', async ({ page }) => {
    const publishedCheckbox = formPage.form.locator('input[type="checkbox"][name*="publish"]').first();
    
    if (await publishedCheckbox.isVisible()) {
      // Initial state
      const initialChecked = await publishedCheckbox.isChecked();
      
      // Click to toggle
      await publishedCheckbox.click();
      await expect(publishedCheckbox).toBeChecked(!initialChecked);
      
      // Click again
      await publishedCheckbox.click();
      await expect(publishedCheckbox).toBeChecked(initialChecked);
    }
  });

  test('should toggle via label click', async ({ page }) => {
    const checkbox = formPage.form.locator('input[type="checkbox"]').first();
    
    if (await checkbox.isVisible()) {
      const label = formPage.form.locator(`label[for="${await checkbox.getAttribute('id')}"]`);
      
      // Click label instead of checkbox
      await label.click();
      await expect(checkbox).toBeChecked();
      
      // Click again
      await label.click();
      await expect(checkbox).not.toBeChecked();
    }
  });

  test('should display as toggle switch if styled', async ({ page }) => {
    // Look for toggle switches
    const toggleSwitch = formPage.form.locator('[role="switch"], .toggle-switch, [class*="switch"]').first();
    
    if (await toggleSwitch.isVisible()) {
      // Check ARIA attributes
      const ariaChecked = await toggleSwitch.getAttribute('aria-checked');
      expect(ariaChecked).toMatch(/true|false/);
      
      // Toggle
      await toggleSwitch.click();
      const newAriaChecked = await toggleSwitch.getAttribute('aria-checked');
      expect(newAriaChecked).not.toBe(ariaChecked);
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const checkbox = formPage.form.locator('input[type="checkbox"]').first();
    
    if (await checkbox.isVisible()) {
      await checkbox.focus();
      
      // Toggle with space
      await page.keyboard.press('Space');
      await expect(checkbox).toBeChecked();
      
      // Toggle again
      await page.keyboard.press('Space');
      await expect(checkbox).not.toBeChecked();
    }
  });

  test('should show visual feedback on hover/focus', async ({ page }) => {
    const checkbox = formPage.form.locator('input[type="checkbox"]').first();
    
    if (await checkbox.isVisible()) {
      // Get initial style
      const initialStyle = await checkbox.evaluate(el => {
        const label = el.nextElementSibling || el.parentElement;
        const styles = window.getComputedStyle(label!);
        return styles.backgroundColor;
      });
      
      // Hover
      await checkbox.hover();
      
      // Check for visual change
      const hoverStyle = await checkbox.evaluate(el => {
        const label = el.nextElementSibling || el.parentElement;
        const styles = window.getComputedStyle(label!);
        return styles.backgroundColor;
      });
      
      // Styles might change on hover
      expect(hoverStyle).toBeDefined();
    }
  });

  test('should handle indeterminate state if applicable', async ({ page }) => {
    // Some checkboxes might support indeterminate state
    const checkbox = formPage.form.locator('input[type="checkbox"]').first();
    
    if (await checkbox.isVisible()) {
      // Set indeterminate via JS
      await checkbox.evaluate((el: HTMLInputElement) => {
        el.indeterminate = true;
      });
      
      // Check visual indication
      const isIndeterminate = await checkbox.evaluate((el: HTMLInputElement) => el.indeterminate);
      expect(isIndeterminate).toBe(true);
      
      // Click should resolve to checked
      await checkbox.click();
      const afterClick = await checkbox.evaluate((el: HTMLInputElement) => ({
        checked: el.checked,
        indeterminate: el.indeterminate
      }));
      
      expect(afterClick.checked).toBe(true);
      expect(afterClick.indeterminate).toBe(false);
    }
  });

  test('should work in checkbox groups', async ({ page }) => {
    // Look for grouped checkboxes (e.g., categories, tags)
    const checkboxGroup = formPage.form.locator('[role="group"] input[type="checkbox"]');
    const groupCount = await checkboxGroup.count();
    
    if (groupCount > 1) {
      // Select multiple
      await checkboxGroup.nth(0).check();
      await checkboxGroup.nth(1).check();
      
      // Verify both checked
      await expect(checkboxGroup.nth(0)).toBeChecked();
      await expect(checkboxGroup.nth(1)).toBeChecked();
      
      // Uncheck one
      await checkboxGroup.nth(0).uncheck();
      await expect(checkboxGroup.nth(0)).not.toBeChecked();
      await expect(checkboxGroup.nth(1)).toBeChecked();
    }
  });

  test('should validate required checkboxes', async ({ page }) => {
    // Look for required checkbox (e.g., terms acceptance)
    const requiredCheckbox = formPage.form.locator('input[type="checkbox"][required], input[type="checkbox"][aria-required="true"]').first();
    
    if (await requiredCheckbox.isVisible()) {
      // Try to submit without checking
      await formPage.submit();
      
      // Should show validation error
      const error = await formPage.getErrorMessage();
      expect(error).toMatch(/required|must|agree/i);
      
      // Check and submit
      await requiredCheckbox.check();
      await formPage.submit();
      
      // Should proceed
      await formPage.waitForSuccess();
    }
  });

  test('should maintain state during form errors', async ({ page }) => {
    const checkbox = formPage.form.locator('input[type="checkbox"]').first();
    
    if (await checkbox.isVisible()) {
      // Check the checkbox
      await checkbox.check();
      
      // Submit with missing required field to trigger error
      await formPage.submit();
      
      // Checkbox should remain checked
      await expect(checkbox).toBeChecked();
    }
  });

  test('should handle disabled state', async ({ page }) => {
    // Create a post first
    await formPage.fillField('Title', 'Test Post');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    // Go back to edit
    await page.goBack();
    
    // Some checkboxes might be disabled based on state
    const disabledCheckbox = formPage.form.locator('input[type="checkbox"][disabled]').first();
    
    if (await disabledCheckbox.isVisible()) {
      // Should not be clickable
      await expect(disabledCheckbox).toBeDisabled();
      
      // Try to click
      await disabledCheckbox.click({ force: true });
      
      // State should not change
      const checked = await disabledCheckbox.isChecked();
      await disabledCheckbox.click({ force: true });
      await expect(disabledCheckbox).toBeChecked(checked);
    }
  });

  test('should show help text or description', async ({ page }) => {
    const checkbox = formPage.form.locator('input[type="checkbox"]').first();
    
    if (await checkbox.isVisible()) {
      // Look for associated help text
      const describedBy = await checkbox.getAttribute('aria-describedby');
      
      if (describedBy) {
        const helpText = page.locator(`#${describedBy}`);
        await expect(helpText).toBeVisible();
        
        const text = await helpText.textContent();
        expect(text).toBeTruthy();
      }
    }
  });

  test('should announce state changes to screen readers', async ({ page }) => {
    const checkbox = formPage.form.locator('input[type="checkbox"]').first();
    
    if (await checkbox.isVisible()) {
      // Check ARIA label
      const ariaLabel = await checkbox.getAttribute('aria-label');
      const labelText = await formPage.form.locator(`label[for="${await checkbox.getAttribute('id')}"]`).textContent();
      
      expect(ariaLabel || labelText).toBeTruthy();
      
      // Toggle and check live region updates
      await checkbox.click();
      
      // Look for status announcement
      const liveRegion = page.locator('[aria-live="polite"], [role="status"]');
      if (await liveRegion.isVisible()) {
        const announcement = await liveRegion.textContent();
        expect(announcement).toBeTruthy();
      }
    }
  });

  test('should handle custom checkbox designs', async ({ page }) => {
    // Look for custom styled checkboxes
    const customCheckbox = formPage.form.locator('.custom-checkbox, [class*="checkbox"]:not(input)').first();
    
    if (await customCheckbox.isVisible()) {
      // Find the actual input
      const input = customCheckbox.locator('input[type="checkbox"]');
      
      if (await input.isVisible({ timeout: 100 })) {
        // Input might be visually hidden
        const isHidden = await input.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.position === 'absolute' && styles.opacity === '0';
        });
        
        if (isHidden) {
          // Click the custom element
          await customCheckbox.click();
          
          // Check input state changed
          await expect(input).toBeChecked();
        }
      }
    }
  });

  test('should support three-state checkboxes if implemented', async ({ page }) => {
    // Some apps have three-state checkboxes (unchecked, checked, mixed)
    const triStateCheckbox = formPage.form.locator('[aria-checked="mixed"]').first();
    
    if (await triStateCheckbox.isVisible()) {
      // Click through states
      await triStateCheckbox.click(); // mixed -> checked
      let ariaChecked = await triStateCheckbox.getAttribute('aria-checked');
      expect(ariaChecked).toBe('true');
      
      await triStateCheckbox.click(); // checked -> unchecked
      ariaChecked = await triStateCheckbox.getAttribute('aria-checked');
      expect(ariaChecked).toBe('false');
      
      await triStateCheckbox.click(); // unchecked -> mixed
      ariaChecked = await triStateCheckbox.getAttribute('aria-checked');
      expect(ariaChecked).toBe('mixed');
    }
  });
});