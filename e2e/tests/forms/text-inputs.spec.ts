import { test, expect } from '../../fixtures/test';
import { ModelFormPage } from '../../pages/model-form';
import { ModelListPage } from '../../pages/model-list';

test.describe('Text Input Fields', () => {
  let formPage: ModelFormPage;
  let listPage: ModelListPage;

  test.beforeEach(async ({ page }) => {
    formPage = new ModelFormPage(page);
    listPage = new ModelListPage(page);
    await page.goto('/admin/user');
    await listPage.clickCreate();
  });

  test('should display text input fields', async ({ page }) => {
    // Check email field
    const emailField = formPage.form.getByLabel('Email');
    await expect(emailField).toBeVisible();
    await expect(emailField).toHaveAttribute('type', 'email');
    
    // Check name field
    const nameField = formPage.form.getByLabel('Name');
    await expect(nameField).toBeVisible();
    await expect(nameField).toHaveAttribute('type', 'text');
  });

  test('should accept text input', async ({ page }) => {
    const testEmail = 'test@example.com';
    const testName = 'Test User';
    
    await formPage.fillField('Email', testEmail);
    await formPage.fillField('Name', testName);
    
    // Verify values
    await expect(formPage.form.getByLabel('Email')).toHaveValue(testEmail);
    await expect(formPage.form.getByLabel('Name')).toHaveValue(testName);
  });

  test('should show required field indicators', async ({ page }) => {
    // Email is required
    const emailLabel = page.locator('label', { hasText: 'Email' });
    const requiredIndicator = emailLabel.locator('text="*", [aria-label="required"]');
    await expect(requiredIndicator).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without required fields
    await formPage.submit();
    
    // Should show error
    const emailError = await formPage.hasFieldError('Email');
    expect(emailError).toBe(true);
    
    // Error message should be visible
    const errorMessage = formPage.form.locator('[role="alert"]').first();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/required|must|please/i);
  });

  test('should validate email format', async ({ page }) => {
    // Enter invalid email
    await formPage.fillField('Email', 'invalid-email');
    await formPage.submit();
    
    // Should show format error
    const errorMessage = await formPage.getErrorMessage();
    expect(errorMessage).toMatch(/valid|email|format/i);
  });

  test('should clear field values', async ({ page }) => {
    // Fill fields
    await formPage.fillField('Email', 'test@example.com');
    await formPage.fillField('Name', 'Test User');
    
    // Clear fields
    const emailField = formPage.form.getByLabel('Email');
    await emailField.clear();
    await expect(emailField).toHaveValue('');
    
    const nameField = formPage.form.getByLabel('Name');
    await nameField.clear();
    await expect(nameField).toHaveValue('');
  });

  test('should handle special characters', async ({ page }) => {
    const specialName = 'Test & User <with> "quotes"';
    await formPage.fillField('Name', specialName);
    
    // Verify value is preserved
    await expect(formPage.form.getByLabel('Name')).toHaveValue(specialName);
  });

  test('should handle long input', async ({ page }) => {
    const longText = 'A'.repeat(100);
    await formPage.fillField('Name', longText);
    
    // Check if there's a max length
    const nameField = formPage.form.getByLabel('Name');
    const maxLength = await nameField.getAttribute('maxlength');
    
    if (maxLength) {
      const actualValue = await nameField.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(parseInt(maxLength));
    } else {
      await expect(nameField).toHaveValue(longText);
    }
  });

  test('should show character count if available', async ({ page }) => {
    const nameField = formPage.form.getByLabel('Name');
    await nameField.fill('Test');
    
    // Look for character count
    const charCount = page.locator('text=/\\d+\\/\\d+/');
    if (await charCount.isVisible()) {
      await expect(charCount).toContainText('4');
    }
  });

  test('should handle paste events', async ({ page }) => {
    const textToPaste = 'pasted@example.com';
    
    // Copy to clipboard and paste
    await page.evaluate((text) => {
      navigator.clipboard.writeText(text);
    }, textToPaste);
    
    const emailField = formPage.form.getByLabel('Email');
    await emailField.focus();
    
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+v`);
    
    await expect(emailField).toHaveValue(textToPaste);
  });

  test('should trim whitespace on blur', async ({ page }) => {
    const emailWithSpaces = '  test@example.com  ';
    
    await formPage.fillField('Email', emailWithSpaces);
    await page.keyboard.press('Tab'); // Blur the field
    
    // Check if trimmed
    const emailField = formPage.form.getByLabel('Email');
    const value = await emailField.inputValue();
    expect(value).toBe(value.trim());
  });

  test('should show placeholder text', async ({ page }) => {
    const emailField = formPage.form.getByLabel('Email');
    const placeholder = await emailField.getAttribute('placeholder');
    
    if (placeholder) {
      expect(placeholder).toMatch(/email|@|example/i);
    }
  });

  test('should support autocomplete', async ({ page }) => {
    const emailField = formPage.form.getByLabel('Email');
    const autocomplete = await emailField.getAttribute('autocomplete');
    
    // Email fields should have appropriate autocomplete
    expect(autocomplete).toMatch(/email|username/);
  });

  test('should be keyboard navigable', async ({ page }) => {
    const emailField = formPage.form.getByLabel('Email');
    const nameField = formPage.form.getByLabel('Name');
    
    // Focus email field
    await emailField.focus();
    await page.keyboard.type('test@example.com');
    
    // Tab to next field
    await page.keyboard.press('Tab');
    
    // Should focus name field
    const focusedElement = page.locator(':focus');
    const focusedId = await focusedElement.getAttribute('id');
    const nameId = await nameField.getAttribute('id');
    expect(focusedId).toBe(nameId);
  });

  test('should support undo/redo', async ({ page }) => {
    const emailField = formPage.form.getByLabel('Email');
    
    await emailField.fill('test@example.com');
    await emailField.fill('changed@example.com');
    
    // Undo
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+z`);
    
    // Should revert to previous value
    await expect(emailField).toHaveValue('test@example.com');
  });

  test('should highlight field on focus', async ({ page }) => {
    const emailField = formPage.form.getByLabel('Email');
    
    // Get initial border/outline
    const initialStyle = await emailField.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        borderColor: styles.borderColor,
        outlineWidth: styles.outlineWidth
      };
    });
    
    // Focus field
    await emailField.focus();
    
    // Get focused style
    const focusedStyle = await emailField.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        borderColor: styles.borderColor,
        outlineWidth: styles.outlineWidth
      };
    });
    
    // Should have different styling
    expect(focusedStyle).not.toEqual(initialStyle);
  });

  test('should disable fields when form is submitting', async ({ page }) => {
    await formPage.fillField('Email', 'test@example.com');
    await formPage.fillField('Name', 'Test User');
    
    // Start submission
    const submitPromise = formPage.submit();
    
    // Check fields are disabled during submission
    const emailField = formPage.form.getByLabel('Email');
    const isDisabled = await emailField.isDisabled();
    
    // Wait for submission to complete
    await submitPromise;
    
    // At some point during submission, field should be disabled
    expect(isDisabled).toBe(true);
  });

  test('should preserve field values on validation error', async ({ page }) => {
    const validName = 'Test User';
    
    // Fill name but not email
    await formPage.fillField('Name', validName);
    await formPage.submit();
    
    // Should show error but preserve name
    await expect(formPage.form.getByLabel('Name')).toHaveValue(validName);
  });

  test('should support field hints/help text', async ({ page }) => {
    // Look for help text near fields
    const emailHelp = page.locator('text=/format|example.*@/i').first();
    if (await emailHelp.isVisible()) {
      await expect(emailHelp).toContainText(/@/);
    }
  });

  test('should handle IME input (for international users)', async ({ page }) => {
    const nameField = formPage.form.getByLabel('Name');
    await nameField.focus();
    
    // Type with composition events (simulating IME)
    await page.keyboard.insertText('こんにちは'); // Japanese text
    
    await expect(nameField).toHaveValue('こんにちは');
  });
});