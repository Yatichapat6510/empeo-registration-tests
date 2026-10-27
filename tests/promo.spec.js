// Feature: promo code validation
const { test, expect } = require('../fixtures/test');
const { FIXED, MSG } = require('../data/testData');

test.describe('Promo code', () => {
  test('TC-PRM-01 valid promo FREE15DAY is accepted and shown as applied @smoke', async ({ page, registerPage }) => {
    const validation = page.waitForResponse(r => r.url().includes('/api/Register/coupon-validation'));
    await registerPage.applyPromo(FIXED.promoCode);
    const res = await validation;
    expect(res.status()).toBe(200);
    expect((await res.json()).data).toMatchObject({ isValid: true, couponCode: FIXED.promoCode });
    await expect(registerPage.appliedPromo(FIXED.promoCode)).toBeVisible();
    await expect(registerPage.promoInput).toBeHidden();
  });

  for (const code of ['INVALID999', 'FREE15DAYX', '12345']) {
    test(`TC-PRM-02 invalid promo "${code}" shows "${MSG.invalidPromo}"`, async ({ registerPage }) => {
      await registerPage.applyPromo(code);
      await expect(registerPage.error(MSG.invalidPromo)).toBeVisible();
      await expect(registerPage.appliedPromo(code)).toBeHidden();
    });
  }

  test('TC-PRM-03 invalid code can be corrected to a valid one', async ({ registerPage }) => {
    await registerPage.applyPromo('WRONGCODE');
    await expect(registerPage.error(MSG.invalidPromo)).toBeVisible();
    await registerPage.applyPromo(FIXED.promoCode);
    await expect(registerPage.appliedPromo(FIXED.promoCode)).toBeVisible();
    await expect(registerPage.error(MSG.invalidPromo)).toBeHidden();
  });

  test('TC-PRM-04 reused promo: FREE15DAY is a multi-use campaign code and is accepted again', async ({ browser, registerPage }) => {
    // Observed on UAT: coupon-validation returns usageCount > 3,000 and isLock=false for FREE15DAY,
    // so "reuse" by a new registration is expected to succeed. See README > Findings.
    await registerPage.applyPromo(FIXED.promoCode);
    await expect(registerPage.appliedPromo(FIXED.promoCode)).toBeVisible();

    const ctx = await browser.newContext();
    const page2 = await ctx.newPage();
    const { RegisterPage } = require('../pages/RegisterPage');
    const second = new RegisterPage(page2);
    await second.open();
    await second.applyPromo(FIXED.promoCode);
    await expect(second.appliedPromo(FIXED.promoCode)).toBeVisible();
    await ctx.close();
  });
});
