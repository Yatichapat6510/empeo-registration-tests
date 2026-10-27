const base = require('@playwright/test');
const { RegisterPage } = require('../pages/RegisterPage');
const { OtpDialog } = require('../pages/OtpDialog');
const { CreatePasswordPage } = require('../pages/CreatePasswordPage');
const { newRegistration } = require('../data/testData');

/**
 * Fixtures: page objects + a fresh, unique registration record per test.
 * `registerPage` is already opened on /Register/empeo.
 */
const test = base.test.extend({
  // Evidence to tell a script problem from a UAT problem: HTTP >= 400 responses and the swal "Oops" popup text.
  _diagnostics: [async ({ page }, use, testInfo) => {
    const bad = [];
    page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.request().method()} ${r.url()}`); });
    await use();
    if (testInfo.status !== testInfo.expectedStatus) {
      const popup = await page.locator('.swal2-container').innerText().catch(() => '');
      const lines = [`swal popup: ${popup || '(none)'}`, ...(bad.length ? bad : ['(no HTTP errors)'])];
      await testInfo.attach('uat-errors.txt', { body: lines.join('\n') });
    }
  }, { auto: true }],
  registerPage: async ({ page }, use) => {
    const rp = new RegisterPage(page);
    await rp.open();
    await use(rp);
  },
  otp: async ({ page }, use) => use(new OtpDialog(page)),
  createPassword: async ({ page }, use) => use(new CreatePasswordPage(page)),
  user: async ({}, use, testInfo) => use(newRegistration(testInfo)),
});

module.exports = { test, expect: base.expect };
