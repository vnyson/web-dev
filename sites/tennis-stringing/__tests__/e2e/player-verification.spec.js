import { test, expect } from '@playwright/test';
import { setupApiMocks, navigateToSite } from './helpers.js';
import { MOCK_PLAYER } from '../fixtures/mock-data.js';

test.describe('Player Verification', () => {
  test('successfully verifies player with name and last 4 digits of phone', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    // Open profile overlay
    const profileButton = page.locator('.profile-button').first();
    await profileButton.click();

    // Fill in verification form
    await page.fill('#verify-name', 'Vinay');
    await page.fill('#verify-phone-last4', '3062');

    // Submit the form
    await page.click('#profile-verify-form button[type="submit"]');

    // Should show profile view panel
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Token should be stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('player_token'));
    expect(token).toBeTruthy();

    // Player name should be displayed
    const nameInput = page.locator('#profile-name');
    await expect(nameInput).toHaveValue(MOCK_PLAYER.name);
  });

  test('handles collision by requesting full phone', async ({ page }) => {
    // Override player-verify to return collision on partial phone
    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith('/api/player-verify') && route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        if (body.phone_last4 && !body.phone) {
          // Return collision when only last 4 are provided
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ multiple: true }),
          });
        }
        if (body.phone) {
          // Return success when full phone is provided
          const { MOCK_PLAYER_BY_TOKEN_RESPONSE } = await import('../fixtures/mock-data.js');
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              token: MOCK_PLAYER.access_token,
              player: MOCK_PLAYER,
              jobs: [],
              rackets: [],
              history: [],
            }),
          });
        }
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 0 }),
      });
    });

    await navigateToSite(page);

    // Open profile overlay
    await page.locator('.profile-button').first().click();

    // Submit with last 4 digits to trigger collision
    await page.fill('#verify-name', 'Vinay');
    await page.fill('#verify-phone-last4', '3062');
    await page.click('#profile-verify-form button[type="submit"]');

    // Wait for collision response
    await page.waitForTimeout(500);

    // Full phone input should now be visible
    const fullPhoneContainer = page.locator('#verify-phone-full-container');
    await expect(fullPhoneContainer).toBeVisible();

    // Enter full phone
    await page.fill('#verify-phone-full', '817-798-3062');
    await page.click('#profile-verify-form button[type="submit"]');

    // Should now verify successfully
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });
  });

  test('reset button clears token and shows verification form', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    // Set a token
    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));

    // Reload to pick up the token
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Should load profile view
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Click reset button
    const resetButton = page.locator('#profile-clear-token-btn');
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    // Should show verification form
    await expect(page.locator('#profile-verify-panel')).toBeVisible();
    await expect(page.locator('#profile-view-panel')).not.toBeVisible();
  });
});
