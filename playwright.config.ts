import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './sites/tennis-stringing/__tests__/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:8080',
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      'npx browser-sync start --server sites/tennis-stringing --no-notify --port 8080 --no-open',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
