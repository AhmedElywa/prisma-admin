#!/usr/bin/env tsx

import { chromium } from '@playwright/test';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Script to help identify and suggest fixes for common Playwright test issues
 */

async function analyzeTests() {
  console.log('🔍 Analyzing Playwright tests for common issues...\n');
  
  const testFiles = await findTestFiles('./e2e/tests');
  
  for (const file of testFiles) {
    console.log(`\n📄 Analyzing: ${file}`);
    const content = await readFile(file, 'utf-8');
    
    // Check for common issues
    const issues: string[] = [];
    
    // Issue 1: Non-specific h1 selectors
    if (content.includes('locator(\'h1\')') && !content.includes('.first()')) {
      issues.push('⚠️  Using locator(\'h1\') without .first() - may match multiple elements');
    }
    
    // Issue 2: Case-sensitive URLs
    if (content.match(/\/admin\/[A-Z]/)) {
      issues.push('⚠️  URL contains uppercase letters - Next.js routes are lowercase');
    }
    
    // Issue 3: Invalid CSS selectors
    if (content.includes('[href!="')) {
      issues.push('⚠️  Invalid CSS selector syntax [href!=...] - use :not([href*=...])');
    }
    
    // Issue 4: Missing waits
    if (content.includes('.click()') && !content.includes('waitFor')) {
      issues.push('💡 Consider adding waitForURL or waitForSelector after navigation clicks');
    }
    
    // Issue 5: Hardcoded timeouts
    if (content.match(/timeout:\s*\d{4,}/)) {
      issues.push('💡 Long timeouts detected - consider using auto-waiting instead');
    }
    
    if (issues.length > 0) {
      console.log('Issues found:');
      issues.forEach(issue => console.log(`  ${issue}`));
    } else {
      console.log('  ✅ No common issues detected');
    }
  }
}

async function testSelectors() {
  console.log('\n\n🌐 Testing actual page selectors...\n');
  
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
    
    for (const { selector, description } of selectors) {
      const count = await page.locator(selector).count();
      console.log(`${description} (${selector}): ${count} found`);
      
      if (count > 1 && selector === 'h1') {
        const texts = await page.locator(selector).allTextContents();
        console.log(`  H1 texts: ${texts.map(t => `"${t}"`).join(', ')}`);
      }
    }
    
    // Check navigation structure
    console.log('\n📍 Navigation structure:');
    const navLinks = await page.locator('nav a').all();
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`  "${text}" → ${href}`);
    }
    
  } catch (error) {
    console.error('❌ Error accessing page:', error);
    console.log('\n💡 Make sure the dev server is running: pnpm dev');
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
      files.push(...await findTestFiles(fullPath));
    } else if (entry.name.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Run the analysis
(async () => {
  await analyzeTests();
  
  console.log('\n' + '='.repeat(50));
  
  const args = process.argv.slice(2);
  if (args.includes('--check-selectors')) {
    await testSelectors();
  } else {
    console.log('\n💡 Run with --check-selectors to test actual page selectors');
  }
  
  console.log('\n✨ Analysis complete!');
})();