// Feature: required fields, format validation and error handling
const { test, expect } = require('../fixtures/test');
const { MSG } = require('../data/testData');

/** Collects POST /api/v2/register calls so a test can prove nothing was submitted. */
function trackRegisterCalls(page) {
  const calls = [];
  page.on('request', r => { if (r.method() === 'POST' && /\/api\/v2\/register$/.test(r.url())) calls.push(r); });
  return calls;
}

test.describe('Form validation', () => {
  test('TC-VAL-01 submitting an empty form shows every required-field message @smoke', async ({ page, registerPage }) => {
    const calls = trackRegisterCalls(page);
    await registerPage.submit();
    for (const msg of Object.values(MSG.required)) {
      await expect(registerPage.error(msg)).toBeVisible();
    }
    await expect(page.locator('.otp-modal')).toBeHidden();
    expect(calls).toHaveLength(0);
  });

  const requiredCases = [
    { field: 'email', message: MSG.required.email },
    { field: 'firstName', message: MSG.required.firstName },
    { field: 'lastName', message: MSG.required.lastName },
    { field: 'businessType', message: MSG.required.businessType },
    { field: 'users', message: MSG.required.users },
  ];
  for (const { field, message } of requiredCases) {
    test(`TC-VAL-02 missing ${field} only -> "${message}"`, async ({ page, registerPage, user }) => {
      const calls = trackRegisterCalls(page);
      await registerPage.fill({ ...user, [field]: field === 'businessType' || field === 'users' ? undefined : '' });
      await registerPage.submit();
      await expect(registerPage.error(message)).toBeVisible();
      await expect(page.locator('.otp-modal')).toBeHidden();
      expect(calls).toHaveLength(0);
    });
  }

  // titles avoid a literal "@" because Playwright reads "@word" in a title as a tag
  for (const bad of ['not-an-email', 'qa@', '@qa-test.co.th', 'qa@qa-test']) {
    test(`TC-VAL-03 invalid email format "${bad.replace('@', '(at)')}" is rejected`, async ({ registerPage, user }) => {
      await registerPage.fill({ ...user, email: bad });
      await registerPage.submit();
      await expect(registerPage.error(MSG.invalidEmail)).toBeVisible();
    });
  }

  test('TC-VAL-04 email on a domain that already has an account is rejected', async ({ page, registerPage, user }) => {
    const calls = trackRegisterCalls(page);
    await registerPage.fill({ ...user, email: `qa.${Date.now()}@example.com` });
    await registerPage.submit();
    await expect(registerPage.error(MSG.duplicateDomain)).toBeVisible();
    expect(calls).toHaveLength(0);
  });

  test('TC-VAL-05 terms not accepted -> registration is not sent', async ({ page, registerPage, user }) => {
    const calls = trackRegisterCalls(page);
    await registerPage.fill({ ...user, acceptTerms: false });
    await expect(registerPage.terms).not.toBeChecked();
    await registerPage.submit();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.otp-modal')).toBeHidden();
    expect(calls).toHaveLength(0);
    // Finding: no message tells the user why nothing happened (see README > Findings).
  });
});
