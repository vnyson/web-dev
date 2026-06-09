import { test, expect } from '@playwright/test';
import { setupApiMocks, navigateToSite } from './helpers.js';

test.describe('Profile Overlay', () => {
  test('opens profile overlay when profile button is clicked', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    // Click the desktop profile button
    const profileButton = page.locator('.profile-button').first();
    await expect(profileButton).toBeVisible();
    await profileButton.click();

    // Overlay should be visible
    const profileOverlay = page.locator('#profile-overlay');
    await expect(profileOverlay).toBeVisible();
    await expect(profileOverlay).not.toHaveClass(/hidden/);
  });

  test('shows verification form when no token exists', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    const profileButton = page.locator('.profile-button').first();
    await profileButton.click();

    // Verify form should be shown
    const verifyForm = page.locator('#profile-verify-form');
    await expect(verifyForm).toBeVisible();

    // Should have name and phone inputs
    const nameInput = page.locator('#verify-name');
    await expect(nameInput).toBeVisible();
    const phoneInput = page.locator('#verify-phone-last4');
    await expect(phoneInput).toBeVisible();
  });

  test('closes overlay when close button is clicked', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    const profileButton = page.locator('.profile-button').first();
    await profileButton.click();

    const profileOverlay = page.locator('#profile-overlay');
    await expect(profileOverlay).toBeVisible();

    // Click close button
    const closeButton = page.locator('.profile-overlay__close');
    await closeButton.click();

    await expect(profileOverlay).not.toBeVisible();
  });

  test('closes overlay when clicking backdrop', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    const profileButton = page.locator('.profile-button').first();
    await profileButton.click();

    const profileOverlay = page.locator('#profile-overlay');
    await expect(profileOverlay).toBeVisible();

    // Click the overlay backdrop (not the content)
    await profileOverlay.click({ position: { x: 10, y: 10 } });
    await expect(profileOverlay).not.toBeVisible();
  });

  test('mobile profile button also opens overlay', async ({ page }) => {
    await setupApiMocks(page);
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToSite(page);

    const mobileProfileButton = page.locator('.profile-button-mobile');
    await expect(mobileProfileButton).toBeVisible();
    await mobileProfileButton.click();

    const profileOverlay = page.locator('#profile-overlay');
    await expect(profileOverlay).toBeVisible();
  });
});
