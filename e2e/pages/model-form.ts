import { Page, Locator } from '@playwright/test';

export class ModelFormPage {
  readonly page: Page;
  readonly form: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('form');
    this.submitButton = page.getByRole('button', { name: /save|submit|create|update/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.deleteButton = page.getByRole('button', { name: /delete/i });
    this.errorMessages = page.locator('[role="alert"]');
  }

  async fillField(label: string, value: string) {
    // Try to find by role with exact name
    let field = this.page.getByRole('textbox', { name: label });
    
    // If not found, try with asterisk
    if (!(await field.isVisible())) {
      field = this.page.getByRole('textbox', { name: `${label} *` });
    }
    
    // If still not found, try partial match
    if (!(await field.isVisible())) {
      field = this.page.getByRole('textbox').filter({ hasText: label }).first();
    }
    
    // Last resort - use locator
    if (!(await field.isVisible())) {
      field = this.form.locator(`input[aria-label*="${label}"], textarea[aria-label*="${label}"]`).first();
    }
    
    await field.fill(value);
  }

  async selectOption(label: string, value: string) {
    const field = this.form.getByLabel(label);
    await field.click();
    await this.page.getByRole('option', { name: value }).click();
  }

  async toggleCheckbox(label: string, check: boolean = true) {
    const checkbox = this.form.getByLabel(label);
    if (check) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  async fillDateField(label: string, date: Date) {
    const field = this.form.getByLabel(label);
    await field.click();
    
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    await field.fill(dateStr);
  }

  async fillJsonField(label: string, json: object) {
    const field = this.form.getByLabel(label);
    await field.fill(JSON.stringify(json, null, 2));
  }

  async connectRelation(label: string, searchTerm: string, optionText: string) {
    const relationField = this.form.getByLabel(label);
    await relationField.click();
    
    // Search in the relation picker
    const searchInput = this.page.getByPlaceholder(/search/i);
    await searchInput.fill(searchTerm);
    
    // Select the option
    await this.page.getByRole('option', { name: optionText }).click();
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async delete() {
    await this.deleteButton.click();
    // Confirm deletion in dialog
    await this.page.getByRole('button', { name: /confirm|yes/i }).click();
  }

  async getFieldValue(label: string): Promise<string> {
    const field = this.form.getByLabel(label);
    return await field.inputValue();
  }

  async getErrorMessage(): Promise<string | null> {
    const errors = await this.errorMessages.allTextContents();
    return errors.length > 0 ? errors.join(', ') : null;
  }

  async hasFieldError(label: string): Promise<boolean> {
    const field = this.form.getByLabel(label);
    const fieldContainer = field.locator('..');
    const error = fieldContainer.locator('[role="alert"], .error-message');
    return await error.isVisible();
  }

  async waitForSuccess() {
    // Wait for success toast or redirect
    await Promise.race([
      this.page.waitForURL('**/admin/**', { timeout: 5000 }),
      this.page.locator('[role="status"]').filter({ hasText: /success/i }).waitFor({ timeout: 5000 })
    ]);
  }
}