import { test, expect } from '@playwright/test';
import { setupApiMocks, navigateToSite } from './helpers.js';

test.describe('Inventory Overlay', () => {
  test('opens inventory overlay when inventory button is clicked', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    const inventoryButton = page.locator('.inventory-button').first();
    await expect(inventoryButton).toBeVisible();
    await inventoryButton.click();

    const inventoryOverlay = page.locator('#inventory-overlay');
    await expect(inventoryOverlay).toBeVisible();
    await expect(inventoryOverlay).not.toHaveClass(/hidden/);
  });

  test('displays inventory table with items', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.locator('.inventory-button').first().click();

    // Wait for inventory to load
    const inventoryGrid = page.locator('#inventory-grid');
    await expect(inventoryGrid).toBeVisible({ timeout: 5000 });

    // Should contain an inventory table
    const table = inventoryGrid.locator('.inventory-table');
    await expect(table).toBeVisible();

    // Should show string items
    await expect(inventoryGrid).toContainText('Tourna Big Hitter Silver 17g');
    await expect(inventoryGrid).toContainText('Wilson NXT 16g');
  });

  test('groups inventory by category with headers', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.locator('.inventory-button').first().click();

    const inventoryGrid = page.locator('#inventory-grid');
    await expect(inventoryGrid).toBeVisible({ timeout: 5000 });

    // Should have category headers
    await expect(inventoryGrid).toContainText('Strings');
    await expect(inventoryGrid).toContainText('Rackets');
    await expect(inventoryGrid).toContainText('Other Equipment');
  });

  test('shows price and string type information', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.locator('.inventory-button').first().click();

    const inventoryGrid = page.locator('#inventory-grid');
    await expect(inventoryGrid).toBeVisible({ timeout: 5000 });

    // Should show prices
    await expect(inventoryGrid).toContainText('$12');
    await expect(inventoryGrid).toContainText('$18');

    // Should show string type
    await expect(inventoryGrid).toContainText('co-poly');
    await expect(inventoryGrid).toContainText('multi');
  });

  test('closes inventory overlay when close button is clicked', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.locator('.inventory-button').first().click();

    const inventoryOverlay = page.locator('#inventory-overlay');
    await expect(inventoryOverlay).toBeVisible();

    const closeButton = page.locator('.inventory-overlay__close');
    await closeButton.click();

    await expect(inventoryOverlay).not.toBeVisible();
  });

  test('mobile inventory button also opens overlay', async ({ page }) => {
    await setupApiMocks(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await navigateToSite(page);

    const mobileInventoryButton = page.locator('.inventory-button-mobile');
    await expect(mobileInventoryButton).toBeVisible();
    await mobileInventoryButton.click();

    const inventoryOverlay = page.locator('#inventory-overlay');
    await expect(inventoryOverlay).toBeVisible();
  });

  test('shows empty message when no inventory items', async ({ page }) => {
    await setupApiMocks(page, { inventory: [] });
    await navigateToSite(page);

    await page.locator('.inventory-button').first().click();

    const inventoryGrid = page.locator('#inventory-grid');
    await expect(inventoryGrid).toBeVisible({ timeout: 5000 });
    await expect(inventoryGrid).toContainText('No inventory items');
  });

  test('closes inventory when clicking backdrop', async ({ page }) => {
    await setupApiMocks(page);
    await navigateToSite(page);

    await page.locator('.inventory-button').first().click();

    const inventoryOverlay = page.locator('#inventory-overlay');
    await expect(inventoryOverlay).toBeVisible();

    await inventoryOverlay.click({ position: { x: 10, y: 10 } });
    await expect(inventoryOverlay).not.toBeVisible();
  });
});
