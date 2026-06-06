import { test, expect } from '@playwright/test';

test.describe('Service Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('renders all three service cards', async ({ page }) => {
    const serviceCards = page.locator('.service-card');
    await expect(serviceCards).toHaveCount(3);
  });

  test('stringing service card has correct content', async ({ page }) => {
    const stringingCard = page.locator('.service-card').nth(0);

    // Should have the stringing heading
    const heading = stringingCard.locator('.service-heading');
    await expect(heading).toContainText('stringing');

    // Should have scaling cost description
    await expect(stringingCard).toContainText('scaling cost');
    await expect(stringingCard).toContainText('$10 OR ½ string msrp');
  });

  test('customization service card has correct content', async ({ page }) => {
    const customizationCard = page.locator('.service-card').nth(1);

    const heading = customizationCard.locator('.service-heading');
    await expect(heading).toContainText('customization + matching');

    // Should list services
    await expect(customizationCard).toContainText('add lead');
    await expect(customizationCard).toContainText('new grips');
    await expect(customizationCard).toContainText('match multiple sticks');
  });

  test('spec-ing service card has correct content', async ({ page }) => {
    const specCard = page.locator('.service-card').nth(2);

    const heading = specCard.locator('.service-heading');
    await expect(heading).toContainText('spec-ing');

    await expect(specCard).toContainText("get your sticks' actual specs");
    await expect(specCard).toContainText('free with stringing');
  });

  test('each service card has a GIF image', async ({ page }) => {
    const serviceGifs = page.locator('.service-gif');
    await expect(serviceGifs).toHaveCount(3);

    // Each GIF should have a src attribute
    for (let i = 0; i < 3; i++) {
      const gif = serviceGifs.nth(i);
      await expect(gif).toBeVisible();
      const src = await gif.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toContain('.gif');
    }
  });

  test('service cards have pixel border styling', async ({ page }) => {
    const serviceCards = page.locator('.service-card');
    const cardsCount = await serviceCards.count();

    for (let i = 0; i < cardsCount; i++) {
      const card = serviceCards.nth(i);
      await expect(card).toHaveClass(/panel-pixel/);
      await expect(card).toHaveClass(/pixel-borders/);
    }
  });
});
