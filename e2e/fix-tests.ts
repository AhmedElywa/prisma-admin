#!/usr/bin/env tsx

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

/**
 * Script to help identify and suggest fixes for common Playwright test issues
 */

async function analyzeTests() {
  const testFiles = await findTestFiles('./e2e/tests');

  for (const file of testFiles) {
    const content = await readFile(file, 'utf-8');

    // Check for common issues
    const issues: string[] = [];

    // Issue 1: Non-specific h1 selectors
    if (content.includes("locator('h1')") && !content.includes('.first()')) {
      issues.push(
        "⚠️  Using locator('h1') without .first() - may match multiple elements"
      );
    }

    // Issue 2: Case-sensitive URLs
    if (content.match(/\/admin\/[A-Z]/)) {
      issues.push(
        '⚠️  URL contains uppercase letters - Next.js routes are lowercase'
      );
    }

    // Issue 3: Invalid CSS selectors
    if (content.includes('[href!="')) {
      issues.push(
        '⚠️  Invalid CSS selector syntax [href!=...] - use :not([href*=...])'
      );
    }

    // Issue 4: Missing waits
    if (content.includes('.click()') && !content.includes('waitFor')) {
      issues.push(
        '💡 Consider adding waitForURL or waitForSelector after navigation clicks'
      );
    }

    // Issue 5: Hardcoded timeouts
    if (content.match(/timeout:\s*\d{4,}/)) {
      issues.push(
        '💡 Long timeouts detected - consider using auto-waiting instead'
      );
    }

    if (issues.length > 0) {
      console.log(`\n📄 ${file}`);
      issues.forEach((issue) => console.log(issue));
    }
  }
}

async function testSelectors() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000/admin');

    // Test common selectors
    const selectors = [
      { selector: 'h1', description: 'H1 headings' },
      { selector: 'nav a', description: 'Navigation links' },
      { selector: '[role="button"]', description: 'Buttons' },
      { selector: '[role="link"]', description: 'Links' },
      { selector: 'main', description: 'Main content area' },
    ];

    for (const { selector } of selectors) {
      const count = await page.locator(selector).count();

      if (count > 1 && selector === 'h1') {
        const _texts = await page.locator(selector).allTextContents();
      }
    }
    const navLinks = await page.locator('nav a').all();
    for (const link of navLinks) {
      const _href = await link.getAttribute('href');
      const _text = await link.textContent();
    }
  } catch (error) {
    console.error('Error during selector test:', error);
  } finally {
    await browser.close();
  }
}

async function findTestFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findTestFiles(fullPath)));
    } else if (entry.name.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Run the analysis
(async () => {
  await analyzeTests();

  const args = process.argv.slice(2);
  if (args.includes('--check-selectors')) {
    await testSelectors();
  }
})();
