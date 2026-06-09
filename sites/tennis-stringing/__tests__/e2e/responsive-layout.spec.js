import { test, expect } from '@playwright/test';
import { setupApiMocks, navigateToSite } from './helpers.js';

test.describe('Responsive Layout', () => {
  test('shows desktop section at desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await setupApiMocks(page);
    await navigateToSite(page);

    // Desktop navigation bar should be visible
    const desktopNav = page.locator('.desktop-navigation-bar');
    await expect(desktopNav).toBeVisible();

    // Desktop customer actions should be visible
    const desktopActions = page.locator('.desktop-customer-actions');
    await expect(desktopActions).toBeVisible();

    // Use first() since there are two .desktop-section elements
    await expect(page.locator('.desktop-section').first()).toBeVisible();
  });

  test('shows mobile navigation at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupApiMocks(page);
    await navigateToSite(page);

    // Mobile navigation should be visible
    const mobileNav = page.locator('.mobile-navigation-bottom');
    await expect(mobileNav).toBeVisible();

    // Mobile profile button should be visible
    const mobileProfileButton = page.locator('.profile-button-mobile');
    await expect(mobileProfileButton).toBeVisible();

    // Mobile inventory button should be visible
    const mobileInventoryButton = page.locator('.inventory-button-mobile');
    await expect(mobileInventoryButton).toBeVisible();

    // Mobile queue indicator should be visible
    const mobileQueue = page.locator('.queue-indicator.mobile');
    await expect(mobileQueue).toBeVisible();
  });

  test('desktop contact card contains business info', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await setupApiMocks(page);
    await navigateToSite(page);

    // Use first() since there are two .contact-header__title elements (desktop + mobile)
    const contactTitle = page.locator('.desktop-section .contact-header__title');
    await expect(contactTitle).toBeVisible();
    await expect(contactTitle).toContainText('rva racket services');

    // Should show name and phone
    const contactInfo = page.locator('.desktop-section .contact-header__info');
    await expect(contactInfo.first()).toBeVisible();
  });

  test('mobile contact section shows business info', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupApiMocks(page);
    await navigateToSite(page);

    // The mobile section has its own contact header
    const mobileContactHeader = page.locator('.mobile-section .contact-header__content');
    await expect(mobileContactHeader).toBeVisible();
    await expect(mobileContactHeader).toContainText('rva racket services');
  });
});
