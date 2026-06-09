import { test, expect } from '@playwright/test';
import { setupApiMocks, navigateToSite } from './helpers.js';
import { MOCK_PLAYER, MOCK_JOBS } from '../fixtures/mock-data.js';

test.describe('Profile View', () => {
  test('loads and displays player profile with token', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    // Set token and reload
    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile view to load
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Check info fields are populated
    await expect(page.locator('#profile-name')).toHaveValue(MOCK_PLAYER.name);
    await expect(page.locator('#profile-email')).toHaveValue(MOCK_PLAYER.email);
    await expect(page.locator('#profile-phone')).toHaveValue(MOCK_PLAYER.phone);
    await expect(page.locator('#profile-string-pref')).toHaveValue(MOCK_PLAYER.string_pref);
    await expect(page.locator('#profile-tension')).toHaveValue(MOCK_PLAYER.tension);
  });

  test('displays job status banner for ready jobs', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Should show ready for pickup status
    const jobStatus = page.locator('#profile-job-status');
    await expect(jobStatus).toBeVisible();
    await expect(jobStatus).toContainText('Ready to pick up');
  });

  test('switches between Info and Jobs tabs', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Info tab should be active by default
    const infoTabContent = page.locator('#profile-tab-info');
    await expect(infoTabContent).toBeVisible();

    const jobsTabContent = page.locator('#profile-tab-jobs');
    await expect(jobsTabContent).not.toBeVisible();

    // Click Jobs tab
    await page.locator('button[data-tab="jobs"]').click();

    // Jobs tab should now be visible
    await expect(jobsTabContent).toBeVisible();
    await expect(infoTabContent).not.toBeVisible();
  });

  test('shows job entries in jobs tab', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Switch to Jobs tab
    await page.locator('button[data-tab="jobs"]').click();

    // Should show job entries
    const jobsList = page.locator('#profile-jobs-list');
    await expect(jobsList).toBeVisible();

    // Should contain job data
    await expect(jobsList).toContainText(MOCK_JOBS[0].racquet);
    await expect(jobsList).toContainText(MOCK_JOBS[0].string_mains);
  });

  test('shows profile image for player', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Profile image should be loaded
    const profileImage = page.locator('#profile-image');
    await expect(profileImage).toBeVisible();
    const src = await profileImage.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('shows racket inventory slots', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Racket slots should be rendered
    const racketSlots = page.locator('.profile-racket-inventory__slot');
    await expect(racketSlots.first()).toBeVisible({ timeout: 5000 });
  });

  test('clicking racket slot shows racket detail', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.evaluate(() => localStorage.setItem('player_token', 'test-token'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.locator('.profile-button').first().click();

    // Wait for profile
    await expect(page.locator('#profile-view-panel')).toBeVisible({ timeout: 5000 });

    // Click first racket slot
    const racketSlots = page.locator('.profile-racket-inventory__slot');
    await racketSlots.first().click();

    // Racket detail should be visible
    const racketDetail = page.locator('#profile-racket-detail');
    await expect(racketDetail).toBeVisible();
    await expect(racketDetail).toContainText('Wilson');
    await expect(racketDetail).toContainText('Pro Staff');
  });
});
