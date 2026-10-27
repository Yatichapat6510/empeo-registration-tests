const { expect } = require('@playwright/test');

/** Page object: OTP verification dialog shown after the registration form is submitted. */
class OtpDialog {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.root = page.locator('.otp-modal');
    this.title = this.root.getByText('กรุณาตรวจสอบข้อความ');
    this.sentTo = this.root.getByText(/โปรดกรอกรหัส OTP ที่ถูกส่งไปยัง/);
    this.refNo = this.root.getByText(/ref:\s*\d+/);
    this.digits = page.getByTestId('input_text_registration_otp_Config').locator('input');
    this.verifyButton = page.getByTestId('button_button_registration_verify');
    this.countdown = this.root.getByText(/รับ OTP ใหม่อีกครั้งได้ใน/);
    this.resendLink = page.getByTestId('button_button_registration_otp_resend');
    this.closeIcon = page.locator('.go5-dialog-icon-close');
    this.toast = page.locator('.go5-toast-description');
  }

  async expectOpen() {
    await expect(this.title).toBeVisible();
    await expect(this.digits).toHaveCount(6);
  }

  async enter(code) {
    await this.digits.first().click();
    await this.page.keyboard.type(code); // the component moves focus to the next box itself
  }

  async verify(code) {
    await this.enter(code);
    await this.verifyButton.click();
  }

  async refText() {
    return (await this.refNo.innerText()).trim();
  }
}

module.exports = { OtpDialog };
