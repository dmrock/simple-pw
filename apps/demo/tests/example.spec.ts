import { test, expect } from '@playwright/test';

test.describe('Demo Tests', () => {
  test('should pass - basic page test', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('should fail - intentional failure', async ({ page }) => {
    await page.goto('https://example.com');
    // This will fail intentionally to test error reporting
    await expect(page).toHaveTitle('This Title Does Not Exist');
  });

  test('should be skipped', async ({ page }) => {
    test.skip(true, 'Skipping this test for demo purposes');
    await page.goto('https://example.com');
  });

  test('should pass - slow test', async ({ page }) => {
    await page.goto('https://httpbin.org/delay/2');
    await expect(page.locator('body')).toContainText('origin');
  });
});
