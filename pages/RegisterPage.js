const { expect } = require('@playwright/test');

/** Page object: empeo free-trial registration form (/Register/empeo). */
class RegisterPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.thaiCompanyRadio = page.getByText('บริษัทจดทะเบียนในไทย', { exact: true });
    this.otherCompanyRadio = page.getByText('อื่นๆ', { exact: true });
    this.companyName = page.getByTestId('input_textfield_input_register_company_name');
    this.taxIdSearch = page.getByTestId('input_textfield_input_registration_tax_id');
    this.businessTypeDropdown = page.getByText('ประเภทธุรกิจ*', { exact: true });
    this.usersDropdown = page.getByText('ผู้ใช้งาน*', { exact: true });
    this.dropdownItems = page.locator('.go5-dropdown-item-body');
    this.email = page.getByTestId('input_textfield_input_registration_email');
    this.firstName = page.getByTestId('input_textfield_input_register_first_name');
    this.lastName = page.getByTestId('input_textfield_input_register_last_name');
    this.phone = page.getByPlaceholder('เบอร์มือถือ*');
    this.promoToggle = page.getByText('ใช้โค้ดส่วนลด', { exact: true });
    this.promoInput = page.getByTestId('input_text_registration_coupon_code');
    this.promoApply = page.getByTestId('input_button_registration_btn_apply');
    this.terms = page.getByTestId('input_checkbox_registration_checkbox');
    this.submitButton = page.getByTestId('button_submit_registration_try_for_free');
  }

  async open() {
    await this.page.goto('/Register/empeo');
    await expect(this.submitButton).toBeVisible();
  }

  async selectOption(dropdown, option) {
    const item = this.dropdownItems.getByText(option, { exact: true });
    await expect(async () => {
      if (!(await item.isVisible())) await dropdown.click();
      await item.click({ timeout: 3_000 });
    }).toPass({ timeout: 20_000 });
  }

  /** Fill the form. Any field left undefined in `data` is skipped. */
  async fill(data) {
    if (data.companyName !== undefined) {
      // "Other" lets us type a free company name (the Thai-company option needs a tax-ID lookup).
      await this.otherCompanyRadio.click();
      await this.companyName.fill(data.companyName);
    }
    if (data.businessType) await this.selectOption(this.businessTypeDropdown, data.businessType);
    if (data.users) await this.selectOption(this.usersDropdown, data.users);
    if (data.email !== undefined) await this.email.fill(data.email);
    if (data.firstName !== undefined) await this.firstName.fill(data.firstName);
    if (data.lastName !== undefined) await this.lastName.fill(data.lastName);
    if (data.phone !== undefined) await this.phone.fill(data.phone);
    if (data.promoCode) await this.applyPromo(data.promoCode);
    if (data.acceptTerms) await this.acceptTerms();
  }

  /** Custom-styled checkbox: a click right after the form re-renders can be swallowed, so retry until checked. */
  async acceptTerms() {
    await expect(async () => {
      if (!(await this.terms.isChecked())) await this.terms.click({ force: true });
      await expect(this.terms).toBeChecked({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
  }

  async applyPromo(code) {
    if (!(await this.promoInput.isVisible())) await this.promoToggle.click();
    await this.promoInput.fill(code);
    await this.promoApply.click();
  }

  /** The chip shown after a promo code is accepted (the input is replaced by the code). */
  appliedPromo(code) {
    return this.page.getByText(code, { exact: true });
  }

  async submit() {
    await this.submitButton.click();
  }

  /** Inline validation message under a field. */
  error(text) {
    return this.page.getByText(text, { exact: true });
  }
}

module.exports = { RegisterPage };
