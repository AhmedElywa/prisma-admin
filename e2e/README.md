# E2E Testing with Playwright

This directory contains end-to-end tests for the Admin Next.js 15 application using Playwright.

## 📋 Prerequisites

- Node.js 20+ installed
- pnpm package manager
- Application database seeded with test data

## 🚀 Getting Started

### Install Dependencies

```bash
pnpm install
```

### Install Playwright Browsers

```bash
pnpm exec playwright install --with-deps
```

## 🧪 Running Tests

### Run All Tests
```bash
pnpm test:e2e
```

### Run Tests in UI Mode (Recommended for Development)
```bash
pnpm test:e2e:ui
```

### Run Tests in Debug Mode
```bash
pnpm test:e2e:debug
```

### Run Tests in Headed Mode
```bash
pnpm test:e2e:headed
```

### View Test Report
```bash
pnpm test:e2e:report
```

### Run Specific Test File
```bash
pnpm test:e2e tests/crud/user.spec.ts
```

### Run Tests with Specific Browser
```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
```

## 📁 Project Structure

```
e2e/
├── fixtures/          # Custom test fixtures and setup
│   └── test.ts       # Extended test context with admin helpers
├── pages/            # Page Object Model classes
│   ├── admin-layout.ts      # Admin layout navigation
│   ├── model-list.ts        # Data table interactions
│   ├── model-form.ts        # Form interactions
│   └── filter-panel.ts      # Filter system interactions
├── helpers/          # Test utilities
│   └── test-data.ts  # Test data generators
└── tests/           # Test suites
    ├── admin-smoke.spec.ts  # Basic smoke tests
    ├── crud/               # CRUD operation tests
    │   └── user.spec.ts
    ├── filters/            # Filter system tests
    │   └── filter-system.spec.ts
    └── settings/           # Admin settings tests
        └── admin-settings.spec.ts
```

## 🎯 Page Object Model

We use the Page Object Model (POM) pattern to organize our tests. Each page or component has a corresponding class that encapsulates its selectors and actions.

### Example Usage

```typescript
import { test, expect } from '../fixtures/test';
import { ModelListPage } from '../pages/model-list';
import { ModelFormPage } from '../pages/model-form';

test('create a new user', async ({ page }) => {
  const listPage = new ModelListPage(page);
  const formPage = new ModelFormPage(page);
  
  await page.goto('/admin/User');
  await listPage.clickCreate();
  
  await formPage.fillField('Email', 'test@example.com');
  await formPage.fillField('Name', 'Test User');
  await formPage.submit();
  
  await expect(page).toHaveURL(/\/admin\/User$/);
});
```

## 📝 Writing New Tests

### 1. Create a New Test File

Create a new test file in the appropriate directory under `tests/`:

```typescript
import { test, expect } from '../../fixtures/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Your test code here
  });
});
```

### 2. Use Page Objects

Always use page objects instead of direct selectors:

```typescript
// ❌ Bad
await page.click('button:has-text("Create")');

// ✅ Good
await listPage.clickCreate();
```

### 3. Use Test Data Generators

Use the TestDataGenerator for creating test data:

```typescript
import { TestDataGenerator } from '../../helpers/test-data';

const userData = TestDataGenerator.generateUser();
const postData = TestDataGenerator.generatePost();
```

### 4. Clean Up Test Data

Tests should clean up after themselves when possible:

```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data
});
```

## 🔧 Configuration

The Playwright configuration is in `playwright.config.ts`. Key settings:

- **Base URL**: `http://localhost:3000`
- **Test Directory**: `./e2e`
- **Browsers**: Chromium, Firefox, WebKit
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

## 🐛 Debugging Tests

### Use UI Mode
The easiest way to debug tests is using UI mode:
```bash
pnpm test:e2e:ui
```

### Use Debug Mode
For step-by-step debugging:
```bash
pnpm test:e2e:debug
```

### Use VS Code Debugger
1. Install the Playwright Test for VS Code extension
2. Click on the green arrow next to any test
3. Set breakpoints as needed

### View Traces
After a test failure, view the trace:
```bash
pnpm test:e2e:report
```

## 🔄 CI/CD Integration

Tests are configured to run in CI with the following optimizations:

- Parallel execution disabled on CI
- Automatic retries (2 attempts)
- HTML reports generated
- Test artifacts uploaded

### GitHub Actions

See `.github/workflows/e2e.yml` for the CI configuration.

## 💡 Best Practices

1. **Keep Tests Independent**: Each test should be able to run in isolation
2. **Use Descriptive Names**: Test names should clearly describe what they test
3. **Avoid Hard-Coded Values**: Use test data generators and constants
4. **Wait for Elements**: Use Playwright's auto-waiting instead of fixed timeouts
5. **Test User Journeys**: Focus on real user workflows
6. **Keep Page Objects Simple**: One responsibility per method
7. **Use Fixtures**: Extend base test with common setup/teardown

## 🚨 Common Issues

### Tests Failing Locally

1. Ensure the dev server is running: `pnpm dev`
2. Check if the database is seeded: `pnpm db:seed`
3. Clear test artifacts: `rm -rf test-results playwright-report`

### Timeout Errors

Increase timeouts in `playwright.config.ts`:
```typescript
timeout: 60000, // 60 seconds
```

### Element Not Found

1. Check if the element exists using UI mode
2. Verify selectors in page objects
3. Add explicit waits if needed

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)