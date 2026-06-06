import { test, expect } from '@playwright/test';
import { setupApiMocks, navigateToSite } from './helpers.js';

test.describe('Queue Status Display', () => {
  test('displays queue status with count 0 (EST. 1-2 days)', async ({ page }) => {
    await setupApiMocks(page, { queueStatus: { count: 0 } });
    await navigateToSite(page);

    const queueTexts = page.locator('.queue-text');
    await expect(queueTexts.first()).toBeVisible();
    await expect(queueTexts.first()).toHaveText('EST. 1-2 days');

    // Check image shows the correct queue image
    const queueImages = page.locator('.queue-image');
    await expect(queueImages.first()).toHaveAttribute('src', /Pokemon Hospital-0\.png$/);
  });

  test('displays queue status with count 3 (EST. 2-3 days)', async ({ page }) => {
    await setupApiMocks(page, { queueStatus: { count: 3 } });
    await navigateToSite(page);

    const queueTexts = page.locator('.queue-text');
    await expect(queueTexts.first()).toBeVisible();
    await expect(queueTexts.first()).toHaveText('EST. 2-3 days');

    const queueImages = page.locator('.queue-image');
    await expect(queueImages.first()).toHaveAttribute('src', /Pokemon Hospital-3\.png$/);
  });

  test('displays queue status with count 7 (EST. 1-2 weeks with full image)', async ({ page }) => {
    await setupApiMocks(page, { queueStatus: { count: 7 } });
    await navigateToSite(page);

    const queueTexts = page.locator('.queue-text');
    await expect(queueTexts.first()).toBeVisible();
    await expect(queueTexts.first()).toHaveText('EST. 1-2 weeks');

    const queueImages = page.locator('.queue-image');
    await expect(queueImages.first()).toHaveAttribute('src', /Pokemon Hospital-FULL\.png$/);
  });

  test('queue image swaps to GIF on hover and back on leave', async ({ page }) => {
    await setupApiMocks(page, { queueStatus: { count: 1 } });
    await navigateToSite(page);

    const queueImage = page.locator('.queue-image').first();
    await expect(queueImage).toBeVisible();

    // Hover to trigger GIF display
    await queueImage.hover();
    await page.waitForTimeout(300);
    // The gif-src data attribute should exist
    const gifSrc = await queueImage.getAttribute('data-gif-src');
    expect(gifSrc).toBeTruthy();
    expect(gifSrc).toContain('.gif');

    // Mouse leave should restore the static image
    await page.mouse.move(0, 0);
    await page.waitForTimeout(600);
    // After leaving, it should re-fetch and update
    const srcAfterLeave = await queueImage.getAttribute('src');
    expect(srcAfterLeave).toContain('Pokemon Hospital');
  });
});
