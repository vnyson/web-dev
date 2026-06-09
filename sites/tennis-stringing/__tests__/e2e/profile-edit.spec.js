import { test, expect } from '@playwright/test';
import { setupApiMocks, navigateToSite } from './helpers.js';

test.describe('Profile Edit', () => {
  test('can edit profile fields and save', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);
    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile view
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Modify email field
    const emailInput = page.locator('#profile-email');
    await emailInput.fill('newemail@example.com');

    // Modify phone
    const phoneInput = page.locator('#profile-phone');
    await phoneInput.fill('555-123-4567');

    // Submit profile edit form
    await page.locator('#profile-edit-form button[type="submit"]').click();

    // Should show loading then success
    await expect(page.locator('#profile-success-alert')).toBeVisible({ timeout: 5000 });
  });

  test('name field is read-only', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);
    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile view
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Name input should have readonly attribute
    const nameInput = page.locator('#profile-name');
    await expect(nameInput).toHaveAttribute('readonly');
  });

  test('can update string preference and notes', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);
    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile view
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Update string pref
    const stringPref = page.locator('#profile-string-pref');
    await stringPref.fill('Luxilon Alu Power 16L');

    // Update notes
    const notes = page.locator('#profile-notes');
    await notes.fill('Prefers dampener, uses overgrip');

    // Submit
    await page.locator('#profile-edit-form button[type="submit"]').click();

    // Should show success
    await expect(page.locator('#profile-success-alert')).toBeVisible({ timeout: 5000 });
  });
});
