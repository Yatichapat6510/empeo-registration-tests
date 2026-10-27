// Feature: OTP verification flow
const { test, expect } = require('../fixtures/test');
const { FIXED, MSG } = require('../data/testData');

test.describe('OTP verification', () => {
  test.beforeEach(async ({ registerPage, otp, user }) => {
    await registerPage.fill(user);
    await registerPage.submit();
    await otp.expectOpen();
  });

  test('TC-OTP-01 correct OTP (123456) moves to the set-password page @smoke', async ({ otp, createPassword }) => {
    await otp.verify(FIXED.otp);
    await createPassword.expectOpen();
  });

  test('TC-OTP-02 wrong OTP shows an error and keeps the user on the OTP dialog', async ({ page, otp }) => {
    await otp.verify('000000');
    await expect(otp.toast).toHaveText(MSG.wrongOtp);
    await expect(otp.title).toBeVisible();
    await expect(page).toHaveURL(/\/Register\/empeo$/);
    // the boxes are cleared so the user can retype
    await expect(otp.digits.first()).toHaveValue('');
  });

  test('TC-OTP-03 wrong OTP first, then the correct OTP still works', async ({ otp, createPassword }) => {
    await otp.verify('111111');
    await expect(otp.toast).toHaveText(MSG.wrongOtp);
    await otp.verify(FIXED.otp);
    await createPassword.expectOpen();
  });

  test('TC-OTP-04 verify button stays disabled until all 6 digits are entered', async ({ page, otp }) => {
    await expect(otp.verifyButton).toBeDisabled();
    await otp.enter('12345');
    await expect(otp.verifyButton).toBeDisabled();
    await page.keyboard.type('6'); // focus is already on the 6th box
    await expect(otp.verifyButton).toBeEnabled();
  });

  test('TC-OTP-05 OTP boxes accept digits only', async ({ otp }) => {
    await otp.enter('ab!@cd');
    await expect(otp.digits.first()).toHaveValue('');
    await expect(otp.verifyButton).toBeDisabled();
  });

  test('TC-OTP-06 resend is locked for 30 s, then sends a new OTP with a new ref', async ({ otp, createPassword }) => {
    test.setTimeout(90_000);
    await expect(otp.countdown).toBeVisible();
    await expect(otp.resendLink).toBeHidden();
    const firstRef = await otp.refText();

    await expect(otp.resendLink).toBeVisible({ timeout: 40_000 }); // countdown 0:30 -> link
    await otp.resendLink.click();
    await expect(otp.refNo).not.toHaveText(firstRef);
    await expect(otp.countdown).toBeVisible(); // timer restarts

    await otp.verify(FIXED.otp); // new OTP works
    await createPassword.expectOpen();
  });

  test('TC-OTP-07 expired OTP is rejected (server response simulated)', async ({ page, otp }) => {
    // The real expiry time is not documented and cannot be forced from the UI, so the verify-otp
    // response is replaced with the same business-error shape the API returns for a bad OTP.
    // Covers the UI side: error shown, user stays on the dialog and is not let through.
    await page.route('**/api/v2/register/verify-otp', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 4001, customMessage: '', description: 'Business error with  1 errors.' },
        data: { subCode: 'E4001', description: 'OTP expired', metaData: {}, customMessage: '' } }),
    }));
    await otp.verify(FIXED.otp);
    await expect(otp.toast).toBeVisible();
    await expect(otp.title).toBeVisible();
    await expect(page).not.toHaveURL(/create-password/);
  });

  test('TC-OTP-08 closing the OTP dialog returns to the form with the data kept', async ({ otp, registerPage, user }) => {
    await otp.closeIcon.click();
    await expect(otp.root).toBeHidden();
    await expect(registerPage.email).toHaveValue(user.email);
    await expect(registerPage.phone).toHaveValue(user.phone);
  });
});
