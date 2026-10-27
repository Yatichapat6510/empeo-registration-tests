// @ts-check
require('dotenv').config({ quiet: true });
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: Number(process.env.TEST_TIMEOUT) || 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://portal.uat.gofive.co.th',
    locale: 'th-TH',
    actionTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      // channel 'chromium' = full Chromium build (also runs headless); avoids the separate headless-shell download
      use: { ...devices['Desktop Chrome'], channel: 'chromium', viewport: { width: 1366, height: 900 } },
    },
  ],
});
