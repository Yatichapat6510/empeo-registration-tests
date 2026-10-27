// Feature: successful registration (happy path, end to end)
const { test, expect } = require('../fixtures/test');
const { FIXED, MSG } = require('../data/testData');

test.describe('Registration - happy path', () => {
  test('TC-REG-01 register with valid data + promo, verify OTP, set password -> trial account ready @smoke @e2e',
    async ({ page, registerPage, otp, createPassword, user }) => {
      await test.step('Fill the form with valid data and promo code FREE15DAY', async () => {
        await registerPage.fill({ ...user, promoCode: FIXED.promoCode });
        await expect(registerPage.appliedPromo(FIXED.promoCode)).toBeVisible();
      });

      const registerRequest = page.waitForRequest(r => r.method() === 'POST' && /\/api\/v2\/register$/.test(r.url()));
      await test.step('Submit -> OTP dialog is shown for the masked phone number', async () => {
        await registerPage.submit();
        await otp.expectOpen();
        await expect(otp.sentTo).toContainText('096-XXX-0708');
        await expect(otp.refNo).toBeVisible();
      });

      await test.step('The register request carries the form data and the promo code', async () => {
        const body = (await registerRequest).postDataJSON();
        expect(body).toMatchObject({
          phone: '+66967690708',
          companyName: user.companyName,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          transactionAmount: user.users,
          couponCode: FIXED.promoCode,
          isThaiCompany: false,
        });
      });

      await test.step('Enter OTP 123456 -> "set password" page', async () => {
        await otp.verify(FIXED.otp);
        await createPassword.expectOpen();
      });

      await test.step('Set a valid password -> "empeo is ready" screen', async () => {
        await createPassword.setPassword(FIXED.password);
        await expect(createPassword.submitButton).toBeEnabled();
        await createPassword.submitButton.click();
        await expect(createPassword.successTitle).toBeVisible({ timeout: 20_000 });
        await expect(createPassword.getStarted).toBeVisible();
      });
    });

  test('TC-REG-02 register without a promo code (promo is optional) -> OTP dialog @smoke',
    async ({ registerPage, otp, user }) => {
      await registerPage.fill(user);
      await registerPage.submit();
      await otp.expectOpen();
      await expect(otp.verifyButton).toBeDisabled(); // nothing typed yet
    });

  test('TC-REG-03 set-password step enforces the password rules',
    async ({ page, registerPage, otp, createPassword, user }) => {
      await registerPage.fill(user);
      await registerPage.submit();
      await otp.verify(FIXED.otp);
      await createPassword.expectOpen();

      for (const weak of ['abc', 'abcdefgh', 'ABCDEFGH1', 'Abcdefgh', 'Ab1']) {
        await createPassword.setPassword(weak);
        await expect(createPassword.submitButton, `"${weak}" should be rejected`).toBeDisabled();
      }
      await test.step('Confirm password does not match -> error, user stays on the page', async () => {
        await createPassword.setPassword(FIXED.password, FIXED.password + 'x');
        await expect(page.getByText(MSG.passwordMismatch, { exact: true })).toBeVisible();
        await createPassword.submitButton.click();
        await expect(createPassword.title).toBeVisible();
        await expect(createPassword.successTitle).toBeHidden();
      });

      await createPassword.setPassword(FIXED.password);
      await expect(createPassword.submitButton).toBeEnabled();
      // Not submitted on purpose: TC-REG-01 already completes an account; keep UAT data low.
    });
});
