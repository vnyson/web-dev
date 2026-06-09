/**
 * Shared helper functions for tennis-stringing E2E tests.
 */

import {
  MOCK_QUEUE_STATUS,
  MOCK_PLAYER_BY_TOKEN_RESPONSE,
  MOCK_PLAYER,
  MOCK_INVENTORY,
} from '../fixtures/mock-data.js';

/**
 * Set up API route mocking for all endpoints the site calls.
 * Call this in each test file's beforeEach.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} options - Override specific mock responses
 * @param {object} [options.queueStatus] - Override queue status response
 * @param {object} [options.playerByToken] - Override player-by-token response
 * @param {object} [options.playerVerifySingle] - Response for single-match verification
 * @param {object} [options.playerVerifyCollision] - Response for collision
 * @param {object} [options.inventory] - Override inventory response
 * @param {object} [options.playerUpdate] - Response for profile update
 */
export async function setupApiMocks(page, options = {}) {
  const {
    queueStatus = MOCK_QUEUE_STATUS,
    playerByToken = MOCK_PLAYER_BY_TOKEN_RESPONSE,
    playerVerifySingle = {
      token: MOCK_PLAYER.access_token,
      player: MOCK_PLAYER,
      jobs: MOCK_PLAYER_BY_TOKEN_RESPONSE.jobs,
      rackets: MOCK_PLAYER_BY_TOKEN_RESPONSE.rackets,
      history: MOCK_PLAYER_BY_TOKEN_RESPONSE.history,
    },
    playerVerifyCollision = { multiple: true },
    inventory = MOCK_INVENTORY,
    playerUpdate = { success: true },
  } = options;

  // Intercept all /api/ requests
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    // Queue status
    if (path.endsWith('/api/queue-status') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(queueStatus),
      });
    }

    // Player by token
    if (path.endsWith('/api/player-by-token') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(playerByToken),
      });
    }

    // Player verify
    if (path.endsWith('/api/player-verify') && method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      // If full phone is provided with collision active, return single match
      if (body.phone && body.phone.length > 7) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(playerVerifySingle),
        });
      }
      // If only last 4 digits and collision is possible, return collision
      if (body.phone_last4 === '3062' && body.name.toLowerCase().includes('vinay')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(playerVerifySingle),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(playerVerifySingle),
      });
    }

    // Player update
    if (path.includes('/api/players/') && method === 'PUT') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(playerUpdate),
      });
    }

    // Inventory
    if (path.endsWith('/api/inventory') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(inventory),
      });
    }

    // Fallback: continue to actual server (shouldn't hit this for test endpoints)
    return route.continue();
  });
}

/**
 * Clear sessionStorage and localStorage. Must be called after page navigation.
 */
export async function clearSession(page) {
  await page.evaluate(() => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (e) {
      // Storage may not be available on about:blank pages
    }
  });
}

/**
 * Navigate to the site and clear session data.
 * Call this instead of page.goto() directly for clean state.
 */
export async function navigateToSite(page, path = '/') {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await clearSession(page);
  // Reload to apply cleared state
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Set a token in localStorage to simulate an authenticated session.
 */
export async function setPlayerToken(page, token = MOCK_PLAYER.access_token) {
  await page.evaluate((t) => {
    localStorage.setItem('player_token', t);
  }, token);
}

/**
 * Get the visible text content of an element.
 */
export async function getText(page, selector) {
  const element = page.locator(selector);
  if (await element.isVisible()) {
    return element.textContent();
  }
  return null;
}
