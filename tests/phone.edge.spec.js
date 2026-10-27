// Edge cases: phone number input
const { test, expect } = require('../fixtures/test');
const { MSG } = require('../data/testData');

test.describe('Phone number edge cases', () => {
  for (const { phone, why } of [
    { phone: '12345', why: 'too short' },
    { phone: '096769070', why: '9 digits' },
    { phone: '09676907089', why: '11 digits' },
  ]) {
    test(`TC-EDGE-01 invalid phone ${phone} (${why}) -> "${MSG.invalidPhone}"`, async ({ page, registerPage, user }) => {
      await registerPage.fill({ ...user, phone });
      await registerPage.submit();
      await expect(registerPage.error(MSG.invalidPhone)).toBeVisible();
      await expect(page.locator('.otp-modal')).toBeHidden();
    });
  }

  test('TC-EDGE-02 letters cannot be typed into the phone field', async ({ registerPage }) => {
    await registerPage.phone.pressSequentially('abcXYZ');
    await expect(registerPage.phone).toHaveValue('');
    // note: "-" is allowed (used as a separator), see README > Findings
  });

  test('TC-EDGE-03 phone field is limited to 15 characters', async ({ registerPage }) => {
    await registerPage.phone.pressSequentially('08123456789012345678');
    await expect(registerPage.phone).toHaveValue('081234567890123');
  });

  test('TC-EDGE-04 empty phone is required', async ({ page, registerPage, user }) => {
    await registerPage.fill({ ...user, phone: '' });
    await registerPage.submit();
    await expect(page.locator('.otp-modal')).toBeHidden();
    await expect(registerPage.phone).toHaveValue('');
  });
});
