import { test, expect } from '@playwright/test';
import { setupApiMocks, navigateToSite } from './helpers.js';
import { MOCK_PLAYER } from '../fixtures/mock-data.js';

test.describe('Token Management', () => {
  test('persists token across page loads', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    // Set token
    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open profile - should load with token
    await page.locator('.profile-button').first().click();
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#profile-name')).toHaveValue(MOCK_PLAYER.name);

    // Close overlay
    await page.locator('.profile-overlay__close').click();

    // Reload page - use goto to preserve localStorage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Token should persist in localStorage
    const token = await page.evaluate(() => localStorage.getItem('player_token'));
    expect(token).toBeTruthy();

    // Open profile again - should load directly without verification
    await page.locator('.profile-button').first().click();
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });
  });

  test('URL token parameter is stored and used', async ({ page }) => {
    await setupApiMocks(page);

    // Navigate with token in URL
    await page.goto(`/?token=${MOCK_PLAYER.access_token}`);
    await page.waitForLoadState('networkidle');

    // Token should be stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('player_token'));
    expect(token).toBe(MOCK_PLAYER.access_token);

    // URL should be cleaned (no token param)
    const url = page.url();
    expect(url).not.toContain('token=');

    // Profile overlay should be open automatically
    const profileOverlay = page.locator('#profile-overlay');
    await expect(profileOverlay).toBeVisible();

    // Profile view should load
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });
  });

  test('reset button removes token from localStorage', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    // Set token and open profile
    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Click reset
    await page.locator('#profile-clear-token-btn').click();

    // Token should be removed from localStorage
    const token = await page.evaluate(() => localStorage.getItem('player_token'));
    expect(token).toBeNull();

    // Verification form should show
    await expect(page.locator('#profile-verify-panel')).toBeVisible();
  });
});
