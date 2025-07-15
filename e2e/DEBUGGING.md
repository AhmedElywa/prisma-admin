# Playwright Test Debugging Guide

## 🚨 Current Test Issues & Solutions

### 1. Multiple Elements Found
**Problem**: `Error: strict mode violation: locator('h1') resolved to 2 elements`

**Solution**:
```typescript
// ❌ Bad
await expect(page.locator('h1')).toContainText('Admin');

// ✅ Good - Be more specific
await expect(page.locator('main h1')).toContainText('Dashboard');
// OR
await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('Dashboard');
```

### 2. Invalid CSS Selectors
**Problem**: `SelectorError: 'a[href^="/admin/"][href!="/admin/settings"]' is not a valid selector`

**Solution**:
```typescript
// ❌ Bad - CSS :not pseudo-class syntax
this.modelLinks = this.sidebar.locator('a[href^="/admin/"][href!="/admin/settings"]');

// ✅ Good - Use proper :not() syntax
this.modelLinks = this.sidebar.locator('a[href^="/admin/"]:not([href*="settings"])');
```

### 3. URL Case Sensitivity
**Problem**: Test expects `/admin/User` but actual URL is `/admin/user`

**Solution**:
```typescript
// ❌ Bad
await page.waitForURL('**/admin/User');

// ✅ Good - Match actual URL casing
await page.waitForURL('**/admin/user');
// OR - Case insensitive regex
await expect(page).toHaveURL(/\/admin\/user/i);
```

## 🛠️ Debugging Tools

### 1. Playwright UI Mode (Recommended)
The most powerful debugging tool - provides visual test execution with time-travel debugging.

```bash
pnpm test:e2e:ui
```

Features:
- 🎯 Pick locator tool
- ⏰ Time-travel through test steps
- 📸 DOM snapshots for each action
- 🔍 Network request inspection
- 📝 Console logs

### 2. Debug Mode with Breakpoints
```bash
pnpm test:e2e:debug
```

Or add breakpoints in code:
```typescript
await page.pause(); // Test will pause here
```

### 3. Slow Motion Debug Config
Run tests slowly with visual feedback:
```bash
pnpm test:e2e:debug:slow
```

This uses our custom debug config with:
- Headed mode (see browser)
- 500ms delay between actions
- Single worker (no parallel execution)
- Extended timeouts

### 4. Trace Viewer
Capture detailed execution traces:
```bash
# Run with trace
pnpm test:e2e:trace

# View trace report
pnpm test:e2e:report
```

## 📋 Debug Checklist

When a test fails:

1. **Run in UI Mode First**
   ```bash
   pnpm test:e2e:ui e2e/tests/failing-test.spec.ts
   ```

2. **Check Selectors**
   - Use the Pick Locator tool in UI mode
   - Verify element exists and is unique
   - Prefer role-based selectors

3. **Verify Timing**
   - Check if elements load dynamically
   - Add explicit waits if needed:
   ```typescript
   await page.waitForSelector('selector');
   await expect(locator).toBeVisible();
   ```

4. **Debug Navigation**
   ```typescript
   // Log current URL
   console.log('Current URL:', page.url());
   
   // Wait for navigation with timeout
   await page.waitForURL(/pattern/, { timeout: 10000 });
   ```

5. **Use Debug Utilities**
   ```typescript
   import { DebugUtils } from '../helpers/debug-utils';
   
   // Debug selector matches
   await DebugUtils.debugSelector(page, 'h1');
   
   // Take screenshot
   await DebugUtils.screenshot(page, 'test-state');
   
   // Interactive pause
   await DebugUtils.interactiveDebug(page, 'Check this state');
   ```

## 🔍 Common Debugging Patterns

### Find Better Selectors
```typescript
// Instead of fragile selectors
const button = page.locator('.btn-primary.submit-button');

// Use semantic selectors
const button = page.getByRole('button', { name: 'Submit' });
```

### Handle Dynamic Content
```typescript
// Wait for content to load
await page.waitForLoadState('networkidle');

// Wait for specific element
await expect(page.getByText('Loading...')).toBeHidden();
```

### Debug Flaky Tests
```typescript
test('flaky test', async ({ page }) => {
  // Add retry logic
  await test.step('Critical action', async () => {
    await expect(async () => {
      await page.click('button');
      await expect(page.locator('.success')).toBeVisible();
    }).toPass({
      intervals: [1000, 2000, 5000],
      timeout: 10000
    });
  });
});
```

## 🎯 Selector Best Practices

### Priority Order:
1. `page.getByRole()` - Most reliable
2. `page.getByLabel()` - For form inputs
3. `page.getByTestId()` - When added specifically for testing
4. `page.getByText()` - For unique text
5. CSS/XPath - Last resort

### Examples:
```typescript
// ✅ Best practices
page.getByRole('button', { name: 'Submit' })
page.getByRole('link', { name: 'Home' })
page.getByLabel('Email')
page.getByTestId('user-profile')
page.getByText('Welcome back')

// ❌ Avoid
page.locator('.btn-submit')
page.locator('#submit-button')
page.locator('div > span.text')
```

## 🐛 Troubleshooting Specific Issues

### "Element not visible"
```typescript
// Ensure element is in viewport
await locator.scrollIntoViewIfNeeded();

// Wait for visibility
await expect(locator).toBeVisible();
```

### "Timeout exceeded"
```typescript
// Increase timeout for specific action
await page.click('button', { timeout: 10000 });

// Or for entire test
test.setTimeout(60000);
```

### "Element is outside viewport"
```typescript
// Scroll to element
await page.locator('selector').scrollIntoViewIfNeeded();

// Or take full page screenshot
await page.screenshot({ fullPage: true });
```

## 🔧 Advanced Debugging

### Network Inspection
```typescript
// Log all API calls
page.on('request', request => {
  console.log('>>', request.method(), request.url());
});

page.on('response', response => {
  console.log('<<', response.status(), response.url());
});
```

### Console Logs
```typescript
// Capture browser console
page.on('console', msg => {
  console.log(`Browser ${msg.type()}: ${msg.text()}`);
});
```

### Custom Debugging HTML Report
```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    // Attach screenshot
    await testInfo.attach('screenshot', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
    
    // Attach HTML
    await testInfo.attach('html', {
      body: await page.content(),
      contentType: 'text/html'
    });
  }
});
```

## 📚 Resources

- [Playwright Debugging Guide](https://playwright.dev/docs/debug)
- [Playwright UI Mode](https://playwright.dev/docs/test-ui-mode)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Selector Best Practices](https://playwright.dev/docs/selectors)

## 💡 Quick Commands Reference

```bash
# Run specific test in UI mode
pnpm test:e2e:ui path/to/test.spec.ts

# Run with specific project
pnpm test:e2e --project=chromium

# Run specific test by name
pnpm test:e2e -g "should load admin"

# Run with max failures
pnpm test:e2e --max-failures=1

# Update snapshots
pnpm test:e2e --update-snapshots
```