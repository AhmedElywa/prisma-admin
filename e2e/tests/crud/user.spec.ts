import { test, expect } from '../../fixtures/test';
import { AdminLayout } from '../../pages/admin-layout';
import { ModelListPage } from '../../pages/model-list';
import { ModelFormPage } from '../../pages/model-form';
import { TestDataGenerator } from '../../helpers/test-data';

test.describe('User CRUD Operations', () => {
  let adminLayout: AdminLayout;
  let listPage: ModelListPage;
  let formPage: ModelFormPage;

  test.beforeEach(async ({ page }) => {
    adminLayout = new AdminLayout(page);
    listPage = new ModelListPage(page);
    formPage = new ModelFormPage(page);
    
    // Navigate to User model
    await page.goto('/admin/user');
  });

  test('should create a new user', async ({ page }) => {
    const userData = TestDataGenerator.generateUser();
    
    // Click create button
    await listPage.clickCreate();
    await expect(page).toHaveURL(/\/admin\/user\/new$/);
    
    // Fill form
    await formPage.fillField('Email', userData.email);
    await formPage.fillField('Name', userData.name || '');
    
    // Submit form
    await formPage.submit();
    await formPage.waitForSuccess();
    
    // Verify redirect to list page
    await expect(page).toHaveURL(/\/admin\/user$/i);
    
    // Search for the created user
    await listPage.search(userData.email);
    
    // Verify user appears in list
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
    
    const emailCell = await listPage.getCellContent(0, 'email');
    expect(emailCell).toContain(userData.email);
  });

  test('should view user details', async ({ page }) => {
    // Create a user first
    const userData = TestDataGenerator.generateUser();
    await listPage.clickCreate();
    await formPage.fillField('Email', userData.email);
    await formPage.fillField('Name', userData.name || '');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    // Search for the user
    await listPage.search(userData.email);
    
    // Click on the user row to view details
    await listPage.clickRowAction(0, 'View');
    
    // Verify we're on the edit page
    await expect(page).toHaveURL(/\/admin\/user\/\d+$/i);
    
    // Verify form is populated with user data
    const emailValue = await formPage.getFieldValue('Email');
    expect(emailValue).toBe(userData.email);
  });

  test('should edit an existing user', async ({ page }) => {
    // Create a user first
    const userData = TestDataGenerator.generateUser();
    await listPage.clickCreate();
    await formPage.fillField('Email', userData.email);
    await formPage.fillField('Name', userData.name || '');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    // Search and edit the user
    await listPage.search(userData.email);
    await listPage.clickRowAction(0, 'Edit');
    
    // Update user data
    const newName = `Updated ${userData.name}`;
    await formPage.fillField('Name', newName);
    await formPage.submit();
    await formPage.waitForSuccess();
    
    // Verify changes
    await listPage.search(userData.email);
    const nameCell = await listPage.getCellContent(0, 'name');
    expect(nameCell).toContain(newName);
  });

  test('should delete a user', async ({ page }) => {
    // Create a user first
    const userData = TestDataGenerator.generateUser();
    await listPage.clickCreate();
    await formPage.fillField('Email', userData.email);
    await formPage.fillField('Name', userData.name || '');
    await formPage.submit();
    await formPage.waitForSuccess();
    
    // Search and delete the user
    await listPage.search(userData.email);
    await listPage.clickRowAction(0, 'Delete');
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes/i }).click();
    
    // Wait for the action to complete
    await page.waitForTimeout(1000);
    
    // Verify user is deleted
    await listPage.search(userData.email);
    const rowCount = await listPage.getRowCount();
    expect(rowCount).toBe(0);
  });

  test('should handle form validation errors', async ({ page }) => {
    await listPage.clickCreate();
    
    // Try to submit empty form
    await formPage.submit();
    
    // Check for validation errors
    const hasEmailError = await formPage.hasFieldError('Email');
    expect(hasEmailError).toBe(true);
    
    // Fill invalid email
    await formPage.fillField('Email', 'invalid-email');
    await formPage.submit();
    
    // Should still have error
    const errorMessage = await formPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });

  test('should bulk delete users', async ({ page }) => {
    // Create multiple users
    const users = Array.from({ length: 3 }, () => TestDataGenerator.generateUser());
    
    for (const userData of users) {
      await listPage.clickCreate();
      await formPage.fillField('Email', userData.email);
      await formPage.fillField('Name', userData.name || '');
      await formPage.submit();
      await formPage.waitForSuccess();
    }
    
    // Select all users
    await listPage.selectAllRows();
    
    // Perform bulk delete
    await listPage.clickBulkAction('Delete');
    await page.getByRole('button', { name: /confirm|yes/i }).click();
    
    // Wait for deletion
    await page.waitForTimeout(2000);
    
    // Verify users are deleted
    for (const userData of users) {
      await listPage.search(userData.email);
      const rowCount = await listPage.getRowCount();
      expect(rowCount).toBe(0);
    }
  });

  test('should paginate through users', async ({ page }) => {
    // Assuming there are enough users for pagination
    // Check if pagination controls exist
    const paginationExists = await listPage.pagination.isVisible();
    
    if (paginationExists) {
      // Get initial row count
      const initialRows = await listPage.getRowCount();
      
      // Go to next page
      await listPage.clickNext();
      
      // Verify URL changed
      await expect(page).toHaveURL(/page=2/);
      
      // Go back to first page
      await listPage.clickPrevious();
      await expect(page).toHaveURL(/\/admin\/user/);
    }
  });
});