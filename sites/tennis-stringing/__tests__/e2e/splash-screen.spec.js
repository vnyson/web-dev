import { test, expect } from '@playwright/test';

test.describe('Splash Screen', () => {
  test('shows splash screen on first visit', async ({ page }) => {
    // Clear sessionStorage on an already-loaded about:blank page
    await page.goto('about:blank');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Splash should be visible initially
    const splash = page.locator('.splash');
    await expect(splash).toBeVisible();
  });

  test('splash has loading animation elements', async ({ page }) => {
    await page.goto('about:blank');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Splash should have the animation image
    const animationImg = page.locator('.splash__animation');
    await expect(animationImg).toBeVisible();
    await expect(animationImg).toHaveAttribute('src', /bike-animation/);

    // Should have loading text
    const loadingText = page.locator('.splash__loading-text');
    await expect(loadingText).toBeVisible();
  });
});
