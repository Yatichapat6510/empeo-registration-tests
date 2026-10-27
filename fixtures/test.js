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
