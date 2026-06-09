import { test, expect } from '@playwright/test';

test.describe('Splash Screen', () => {
  test('shows splash screen on first visit', async ({ page }) => {
    // Clear storage before page loads via init script
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const splash = page.locator('.splash');
    await expect(splash).toBeVisible();
  });

  test('splash has loading animation elements', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const animationImg = page.locator('.splash__animation');
    await expect(animationImg).toBeVisible();
    await expect(animationImg).toHaveAttribute('src', /bike-antimation-front-large/);

    const loadingText = page.locator('.splash__loading-text');
    await expect(loadingText).toBeVisible();
  });
});
