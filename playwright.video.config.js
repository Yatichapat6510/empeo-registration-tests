// @ts-check
// Same suite, but records video + trace + screenshot for EVERY test, one test at a time.
// Used to produce the submission video:  npm run test:video
const base = require('./playwright.config');
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  ...base,
  workers: 1,
  fullyParallel: false,
  use: {
    ...base.use,
    video: { mode: 'on', size: { width: 1366, height: 900 } },
    trace: 'on',
    screenshot: 'on',
    launchOptions: { slowMo: Number(process.env.SLOW_MO) || 200 },
  },
});
