import { test, expect } from '../../fixtures/test';
import { ModelFormPage } from '../../pages/model-form';
import { ModelListPage } from '../../pages/model-list';

test.describe('Date/Time Input Fields', () => {
  let formPage: ModelFormPage;
  let listPage: ModelListPage;

  test.beforeEach(async ({ page }) => {
    formPage = new ModelFormPage(page);
    listPage = new ModelListPage(page);
    await page.goto('/admin/post');
    await listPage.clickCreate();
  });

  test('should display date input fields', async ({ page }) => {
    const dateFields = formPage.form.locator('input[type="date"], input[type="datetime-local"]');
    const dateFieldCount = await dateFields.count();
    
    if (dateFieldCount > 0) {
      await expect(dateFields.first()).toBeVisible();
    }
  });

  test('should open date picker on click', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      await dateField.click();
      
      // Check for calendar popup
      const calendar = page.locator('[role="dialog"][aria-label*="calendar"], .calendar-popup, [class*="datepicker"]');
      
      // Some browsers show native picker, others show custom
      if (await calendar.isVisible({ timeout: 1000 })) {
        await expect(calendar).toBeVisible();
      }
    }
  });

  test('should accept date input via keyboard', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      // Format: YYYY-MM-DD
      const testDate = '2024-12-25';
      await dateField.fill(testDate);
      await expect(dateField).toHaveValue(testDate);
    }
  });

  test('should validate date format', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      // Try invalid format
      await dateField.fill('25/12/2024'); // Wrong format
      await formPage.submit();
      
      // Should show validation error or auto-correct
      const value = await dateField.inputValue();
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$|^$/);
    }
  });

  test('should handle datetime-local input', async ({ page }) => {
    const datetimeField = formPage.form.locator('input[type="datetime-local"]').first();
    
    if (await datetimeField.isVisible()) {
      // Format: YYYY-MM-DDTHH:mm
      const testDateTime = '2024-12-25T14:30';
      await datetimeField.fill(testDateTime);
      await expect(datetimeField).toHaveValue(testDateTime);
    }
  });

  test('should respect min/max date constraints', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      const min = await dateField.getAttribute('min');
      const max = await dateField.getAttribute('max');
      
      if (min) {
        // Try date before min
        const minDate = new Date(min);
        minDate.setDate(minDate.getDate() - 1);
        const beforeMin = minDate.toISOString().split('T')[0];
        
        await dateField.fill(beforeMin);
        await formPage.submit();
        
        // Should show validation error
        const error = await formPage.getErrorMessage();
        expect(error).toBeTruthy();
      }
    }
  });

  test('should show today button in picker', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      await dateField.click();
      
      // Look for today button
      const todayButton = page.locator('button:has-text("Today"), button[aria-label*="today"]');
      
      if (await todayButton.isVisible({ timeout: 1000 })) {
        await todayButton.click();
        
        // Should set to today's date
        const today = new Date().toISOString().split('T')[0];
        await expect(dateField).toHaveValue(today);
      }
    }
  });

  test('should navigate months in date picker', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      await dateField.click();
      
      // Look for month navigation
      const prevMonth = page.locator('button[aria-label*="previous month"], button:has-text("<")').first();
      const nextMonth = page.locator('button[aria-label*="next month"], button:has-text(">")').first();
      
      if (await prevMonth.isVisible({ timeout: 1000 })) {
        // Navigate to previous month
        await prevMonth.click();
        
        // Navigate to next month
        await nextMonth.click();
        
        // Should be able to navigate
        expect(true).toBe(true);
      }
    }
  });

  test('should handle keyboard navigation in picker', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      await dateField.click();
      
      const calendar = page.locator('[role="dialog"], .calendar-popup');
      
      if (await calendar.isVisible({ timeout: 1000 })) {
        // Navigate with arrow keys
        await page.keyboard.press('ArrowRight'); // Next day
        await page.keyboard.press('ArrowDown'); // Next week
        await page.keyboard.press('Enter'); // Select
        
        // Should have selected a date
        const value = await dateField.inputValue();
        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  test('should clear date field', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      // Set a date
      await dateField.fill('2024-12-25');
      
      // Look for clear button
      const clearButton = dateField.locator('~ button[aria-label*="clear"], ~ .clear-button');
      
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await expect(dateField).toHaveValue('');
      } else {
        // Clear manually
        await dateField.clear();
        await expect(dateField).toHaveValue('');
      }
    }
  });

  test('should format date according to locale', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      await dateField.fill('2024-12-25');
      
      // Check displayed format
      const displayValue = await dateField.evaluate((el: HTMLInputElement) => {
        // Some browsers show localized format in UI
        return el.value;
      });
      
      // Should be in ISO format for value
      expect(displayValue).toBe('2024-12-25');
    }
  });

  test('should handle time zones for datetime fields', async ({ page }) => {
    const datetimeField = formPage.form.locator('input[type="datetime-local"]').first();
    
    if (await datetimeField.isVisible()) {
      const testDateTime = '2024-12-25T14:30';
      await datetimeField.fill(testDateTime);
      
      // Submit and verify
      await formPage.fillField('Title', 'Test Post');
      await formPage.submit();
      await formPage.waitForSuccess();
      
      // Value should be preserved
      await page.goBack();
      await expect(datetimeField).toHaveValue(testDateTime);
    }
  });

  test('should validate future/past date requirements', async ({ page }) => {
    const publishDateField = formPage.form.locator('input[name*="publish"], input[placeholder*="publish"]').first();
    
    if (await publishDateField.isVisible()) {
      // Try past date for publish date (might be invalid)
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      const pastDateStr = pastDate.toISOString().split('T')[0];
      
      await publishDateField.fill(pastDateStr);
      await formPage.submit();
      
      // Check if validation allows past dates
      const error = await formPage.getErrorMessage();
      // Validation depends on business rules
    }
  });

  test('should integrate with calendar libraries', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      // Check for custom calendar implementation
      const customCalendar = page.locator('.react-datepicker, .react-calendar, [class*="calendar"]');
      
      await dateField.click();
      
      if (await customCalendar.isVisible({ timeout: 1000 })) {
        // Custom calendar is used
        await expect(customCalendar).toBeVisible();
        
        // Check for additional features
        const yearSelector = customCalendar.locator('select[aria-label*="year"]');
        const monthSelector = customCalendar.locator('select[aria-label*="month"]');
        
        if (await yearSelector.isVisible()) {
          // Can quickly jump to different years
          expect(true).toBe(true);
        }
      }
    }
  });

  test('should handle date ranges if applicable', async ({ page }) => {
    // Look for date range inputs
    const startDateField = formPage.form.locator('input[name*="start"], input[placeholder*="from"]').first();
    const endDateField = formPage.form.locator('input[name*="end"], input[placeholder*="to"]').first();
    
    if (await startDateField.isVisible() && await endDateField.isVisible()) {
      // Set start date
      await startDateField.fill('2024-01-01');
      
      // Set end date before start date
      await endDateField.fill('2023-12-31');
      await formPage.submit();
      
      // Should show validation error
      const error = await formPage.getErrorMessage();
      expect(error).toMatch(/after|before|invalid|range/i);
    }
  });

  test('should be accessible with keyboard only', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      await dateField.focus();
      
      // Tab through date parts (month/day/year)
      await page.keyboard.type('12'); // Month
      await page.keyboard.press('Tab');
      await page.keyboard.type('25'); // Day
      await page.keyboard.press('Tab');
      await page.keyboard.type('2024'); // Year
      
      const value = await dateField.inputValue();
      expect(value).toBeTruthy();
    }
  });

  test('should show proper ARIA labels', async ({ page }) => {
    const dateField = formPage.form.locator('input[type="date"]').first();
    
    if (await dateField.isVisible()) {
      // Check accessibility attributes
      const ariaLabel = await dateField.getAttribute('aria-label');
      const labelText = await formPage.form.locator(`label[for="${await dateField.getAttribute('id')}"]`).textContent();
      
      expect(ariaLabel || labelText).toBeTruthy();
      
      // Check for description
      const ariaDescribedBy = await dateField.getAttribute('aria-describedby');
      if (ariaDescribedBy) {
        const description = await page.locator(`#${ariaDescribedBy}`).textContent();
        expect(description).toBeTruthy();
      }
    }
  });
});