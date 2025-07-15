import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Debug configuration for Playwright tests
 * Use: pnpm test:e2e --config=playwright.config.debug.ts
 */
export default defineConfig({
  ...baseConfig,
  
  // Reduce parallel execution for easier debugging
  workers: 1,
  fullyParallel: false,
  
  // Longer timeouts for debugging
  timeout: 120000, // 2 minutes per test
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },
  
  use: {
    ...baseConfig.use,
    
    // Visual debugging
    headless: false,
    
    // Always capture artifacts
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    
    // Viewport for debugging
    viewport: { width: 1280, height: 720 },
  },
  
  // Only run in Chrome for debugging
  projects: [
    {
      name: 'chromium-debug',
      use: { ...baseConfig.projects![0].use },
    },
  ],
});