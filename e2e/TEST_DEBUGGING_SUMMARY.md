# 🛠️ Playwright Test Debugging Setup Summary

We've set up a comprehensive debugging infrastructure for Playwright tests. Here's everything available to help debug and fix failing tests:

## 🚀 Quick Start: Debugging Workflow

When tests fail, follow this workflow:

1. **Analyze issues automatically**:
   ```bash
   pnpm test:e2e:analyze
   ```

2. **Run in UI Mode** (most effective):
   ```bash
   pnpm test:e2e:ui
   ```

3. **Debug with slow motion**:
   ```bash
   pnpm test:e2e:debug:slow
   ```

4. **Check live selectors**:
   ```bash
   pnpm dev  # In one terminal
   pnpm test:e2e:analyze:live  # In another
   ```

## 📁 New Files Created

### 1. **Debug Configuration** (`playwright.config.debug.ts`)
- Runs tests slowly in headed mode
- Single worker for easier debugging
- Extended timeouts
- Always captures screenshots/videos

### 2. **Debug Utilities** (`e2e/helpers/debug-utils.ts`)
- `waitForAdminPage()` - Ensures page is fully loaded
- `debugSelector()` - Shows all matching elements
- `screenshot()` - Takes named screenshots
- `logPageInfo()` - Logs URL and title
- `findBestSelector()` - Suggests optimal selectors
- `interactiveDebug()` - Pauses with context info

### 3. **Debug Test Suite** (`e2e/tests/admin-smoke-debug.spec.ts`)
- Enhanced smoke tests with debugging
- Console and error logging
- Detailed selector debugging
- Interactive exploration test

### 4. **Test Analyzer** (`e2e/fix-tests.ts`)
- Scans test files for common issues
- Checks for problematic patterns
- Can test selectors against live page

### 5. **Documentation**
- `DEBUGGING.md` - Comprehensive debugging guide
- `TEST_DEBUGGING_SUMMARY.md` - This file

## 🔧 Available Commands

```bash
# Standard test commands
pnpm test:e2e              # Run all tests
pnpm test:e2e:ui           # UI mode (recommended for debugging)
pnpm test:e2e:debug        # Debug mode with breakpoints
pnpm test:e2e:headed       # Headed mode (see browser)

# Enhanced debugging commands
pnpm test:e2e:debug:slow   # Slow motion with full debugging
pnpm test:e2e:trace        # Capture detailed traces
pnpm test:e2e:report       # View test reports/traces

# Analysis commands
pnpm test:e2e:analyze      # Analyze test files for issues
pnpm test:e2e:analyze:live # Test selectors on live page
```

## 🐛 Common Issues Fixed

### 1. **Multiple Element Matches**
```typescript
// ❌ Problem
await expect(page.locator('h1')).toContainText('Admin');

// ✅ Solution
await expect(page.locator('main h1')).toContainText('Dashboard');
```

### 2. **URL Case Sensitivity**
```typescript
// ❌ Problem
await page.waitForURL('**/admin/User');

// ✅ Solution
await page.waitForURL('**/admin/user');
```

### 3. **Invalid Selectors**
```typescript
// ❌ Problem
page.locator('a[href^="/admin/"][href!="/admin/settings"]')

// ✅ Solution
page.locator('a[href^="/admin/"]:not([href*="settings"])')
```

## 🎯 Next Steps to Fix Tests

1. **Run the analyzer** to identify issues:
   ```bash
   pnpm test:e2e:analyze
   ```

2. **Use UI mode** to visually debug:
   ```bash
   pnpm test:e2e:ui e2e/tests/admin-smoke.spec.ts
   ```

3. **Update selectors** using the debug utilities:
   ```typescript
   import { DebugUtils } from '../helpers/debug-utils';
   
   // In your test
   await DebugUtils.debugSelector(page, 'your-selector');
   ```

4. **Fix timing issues** with proper waits:
   ```typescript
   await page.waitForLoadState('networkidle');
   await expect(element).toBeVisible();
   ```

## 🔮 Future: Playwright MCP Integration

For even better debugging with Claude Code, you can set up Playwright MCP:

```bash
# Add Playwright MCP to Claude Code
claude mcp add playwright npx @playwright/mcp@latest
```

This allows Claude to:
- Control browser directly
- See page state in real-time
- Debug interactively
- Fix tests automatically

## 📚 Resources

- [Debugging Guide](./DEBUGGING.md) - Detailed debugging strategies
- [E2E README](./README.md) - General E2E testing guide
- [Debug Test](./tests/admin-smoke-debug.spec.ts) - Example with debugging
- [Playwright Docs](https://playwright.dev/docs/debug) - Official docs

## 💡 Pro Tips

1. **Always start with UI mode** - It's the fastest way to understand failures
2. **Use role-based selectors** - They're more stable than CSS
3. **Add custom test IDs** if needed - `data-testid` attributes
4. **Check network requests** - API failures often cause test failures
5. **Use the trace viewer** - It captures everything for debugging

With these tools and strategies, you should be able to identify and fix any Playwright test issues effectively!