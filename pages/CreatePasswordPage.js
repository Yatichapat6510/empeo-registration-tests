const { expect } = require('@playwright/test');

/** Page object: "set password" step reached after a correct OTP, plus the final success screen. */
class CreatePasswordPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title = page.getByText('กรุณาตั้งรหัสผ่าน', { exact: true });
    this.password = page.getByTestId('input_textfield_input_input_password_crate_password_password');
    this.confirm = page.getByTestId('input_textfield_input_input_password_crate_password_confirm_password');
    this.submitButton = page.getByTestId('button_button_create_password_btn_next');
    this.successTitle = page.getByText('empeo พร้อมใช้งานแล้ว!', { exact: true });
    this.getStarted = page.getByTestId('button_button_create_password_btn_lets_get_started');
  }

  async expectOpen() {
    await expect(this.title).toBeVisible({ timeout: 30_000 }); // UAT is slow under load
    await expect(this.page).toHaveURL(/\/Register\/empeo\/create-password\?token=/, { timeout: 30_000 });
  }

  async setPassword(password, confirm = password) {
    await this.password.fill(password);
    await this.confirm.fill(confirm);
  }
}

module.exports = { CreatePasswordPage };
