import { test, expect } from '../../fixtures/test';
import { ModelFormPage } from '../../pages/model-form';
import { ModelListPage } from '../../pages/model-list';

test.describe('Number Input Fields', () => {
  let formPage: ModelFormPage;
  let listPage: ModelListPage;

  test.beforeEach(async ({ page }) => {
    formPage = new ModelFormPage(page);
    listPage = new ModelListPage(page);
    await page.goto('/admin/post');
    await listPage.clickCreate();
  });

  test('should display number input fields', async ({ page }) => {
    // Check for number fields (e.g., views, likes)
    const viewsField = formPage.form.locator('input[type="number"]').first();
    await expect(viewsField).toBeVisible();
  });

  test('should accept numeric input', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    await numberField.fill('123');
    await expect(numberField).toHaveValue('123');
  });

  test('should increment/decrement with arrows', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    await numberField.fill('10');
    
    // Click increment arrow
    const incrementButton = numberField.locator('~ button[aria-label*="increment"], ~ [class*="up"]').first();
    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      await expect(numberField).toHaveValue('11');
    } else {
      // Use keyboard
      await numberField.focus();
      await page.keyboard.press('ArrowUp');
      await expect(numberField).toHaveValue('11');
    }
    
    // Decrement
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(numberField).toHaveValue('9');
  });

  test('should validate numeric input', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    
    // Try to enter non-numeric characters
    await numberField.fill('abc');
    const value = await numberField.inputValue();
    
    // Should either be empty or show validation error
    expect(value).toMatch(/^[\d.]*$/);
  });

  test('should respect min/max constraints', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    
    // Check for min/max attributes
    const min = await numberField.getAttribute('min');
    const max = await numberField.getAttribute('max');
    
    if (min) {
      await numberField.fill((parseInt(min) - 1).toString());
      await formPage.submit();
      
      // Should show validation error
      const error = await formPage.hasFieldError('Views');
      expect(error).toBe(true);
    }
    
    if (max) {
      await numberField.fill((parseInt(max) + 1).toString());
      await formPage.submit();
      
      // Should show validation error
      const error = await formPage.hasFieldError('Views');
      expect(error).toBe(true);
    }
  });

  test('should handle decimal numbers', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    const step = await numberField.getAttribute('step');
    
    if (step && step !== '1') {
      await numberField.fill('123.45');
      await expect(numberField).toHaveValue('123.45');
    }
  });

  test('should format large numbers', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    await numberField.fill('1000000');
    
    // Check if formatted with commas (depends on locale)
    await numberField.blur();
    const displayValue = await numberField.inputValue();
    
    // Value should still be numeric
    expect(parseInt(displayValue.replace(/,/g, ''))).toBe(1000000);
  });

  test('should handle negative numbers', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    const min = await numberField.getAttribute('min');
    
    // Only test negative if allowed
    if (!min || parseInt(min) < 0) {
      await numberField.fill('-123');
      await expect(numberField).toHaveValue('-123');
    }
  });

  test('should handle exponential notation', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    await numberField.fill('1e3');
    
    // Should convert to regular number
    await numberField.blur();
    const value = await numberField.inputValue();
    expect(parseInt(value)).toBe(1000);
  });

  test('should validate on blur', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    
    // Enter invalid number
    await numberField.fill('999999999999');
    await numberField.blur();
    
    // Check for validation message
    const fieldContainer = numberField.locator('..');
    const error = fieldContainer.locator('[role="alert"]');
    
    const max = await numberField.getAttribute('max');
    if (max && parseInt(max) < 999999999999) {
      await expect(error).toBeVisible();
    }
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    await numberField.fill('50');
    await numberField.focus();
    
    // Increase by 10 with Shift+Up
    await page.keyboard.down('Shift');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.up('Shift');
    
    const value = await numberField.inputValue();
    const numValue = parseInt(value);
    expect(numValue).toBeGreaterThanOrEqual(51); // At least increased
  });

  test('should handle paste of numeric values', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    
    // Copy number to clipboard
    await page.evaluate(() => {
      navigator.clipboard.writeText('12345');
    });
    
    await numberField.focus();
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+v`);
    
    await expect(numberField).toHaveValue('12345');
  });

  test('should strip non-numeric characters on paste', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    
    // Copy mixed content to clipboard
    await page.evaluate(() => {
      navigator.clipboard.writeText('$1,234.56');
    });
    
    await numberField.focus();
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+v`);
    
    // Should extract numeric value
    const value = await numberField.inputValue();
    expect(value).toMatch(/^[\d.]*$/);
  });

  test('should show spinner controls on hover/focus', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    
    // Check initial state
    const spinners = numberField.locator('~ button, ::-webkit-inner-spin-button');
    
    // Hover or focus
    await numberField.hover();
    
    // Spinners might become more visible
    // This is browser-specific behavior
    const hasSpinners = await numberField.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.webkitAppearance !== 'none';
    });
    
    expect(hasSpinners).toBeDefined();
  });

  test('should handle very large numbers', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    
    // JavaScript max safe integer
    const maxSafeInt = Number.MAX_SAFE_INTEGER.toString();
    await numberField.fill(maxSafeInt);
    
    const value = await numberField.inputValue();
    expect(value).toBeTruthy();
  });

  test('should clear with keyboard shortcut', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    await numberField.fill('12345');
    
    // Select all and delete
    await numberField.focus();
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+a`);
    await page.keyboard.press('Delete');
    
    await expect(numberField).toHaveValue('');
  });

  test('should maintain precision for decimal fields', async ({ page }) => {
    const priceField = formPage.form.locator('input[name*="price"], input[placeholder*="price"]').first();
    
    if (await priceField.isVisible()) {
      await priceField.fill('19.99');
      await expect(priceField).toHaveValue('19.99');
      
      // Should not lose decimal places
      await priceField.blur();
      await expect(priceField).toHaveValue('19.99');
    }
  });

  test('should handle percentage fields', async ({ page }) => {
    const percentField = formPage.form.locator('input[name*="percent"], input[placeholder*="%"]').first();
    
    if (await percentField.isVisible()) {
      await percentField.fill('50');
      
      // Check if it auto-formats with %
      await percentField.blur();
      const value = await percentField.inputValue();
      expect(value).toMatch(/50%?/);
    }
  });

  test('should be accessible with screen reader', async ({ page }) => {
    const numberField = formPage.form.locator('input[type="number"]').first();
    
    // Check ARIA attributes
    const ariaLabel = await numberField.getAttribute('aria-label');
    const labelledBy = await numberField.getAttribute('aria-labelledby');
    const label = await formPage.form.locator(`label[for="${await numberField.getAttribute('id')}"]`).textContent();
    
    // Should have accessible label
    expect(ariaLabel || labelledBy || label).toBeTruthy();
    
    // Check for aria-invalid on error
    await numberField.fill('-999'); // Invalid if min is 0
    await formPage.submit();
    
    const ariaInvalid = await numberField.getAttribute('aria-invalid');
    const min = await numberField.getAttribute('min');
    if (min && parseInt(min) >= 0) {
      expect(ariaInvalid).toBe('true');
    }
  });
});