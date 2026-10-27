// Test data. Fixed values come from the exam brief; everything else is generated per test
// so tests never collide (the system rejects a company name or email domain that already exists).

const FIXED = {
  phone: process.env.TEST_PHONE || '0967690708',
  otp: process.env.TEST_OTP || '123456',
  promoCode: process.env.PROMO_CODE || 'FREE15DAY',
  password: 'QaAuto12345', // meets the rules: upper + lower case, a digit, 8+ characters
};

// UI messages (Thai locale) observed on UAT on 27 Oct 2026
const MSG = {
  required: {
    businessType: 'กรุณากรอกประเภทธุรกิจ',
    users: 'กรุณากรอกผู้ใช้งาน',
    email: 'กรุณากรอกอีเมล',
    firstName: 'กรุณากรอกชื่อ',
    lastName: 'กรุณากรอกนามสกุล',
  },
  invalidEmail: 'กรุณาใส่อีเมลที่ถูกต้อง',
  duplicateDomain: 'โดเมนนี้มีบัญชีใช้งานแล้ว',
  invalidPhone: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
  invalidPromo: 'คูปองโค้ดไม่ถูกต้อง',
  otpTitle: 'กรุณาตรวจสอบข้อความ',
  wrongOtp: 'OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
  createPasswordTitle: 'กรุณาตั้งรหัสผ่าน',
  passwordMismatch: 'รหัสผ่านไม่ตรงกัน',
  success: 'empeo พร้อมใช้งานแล้ว!',
};

/** Unique, valid registration data for one test. */
function newRegistration(testInfo, overrides = {}) {
  const sfx = `${Date.now().toString(36)}${testInfo.workerIndex}${Math.floor(Math.random() * 1000)}`;
  return {
    companyName: `QA Auto Co ${sfx}`,
    businessType: 'เทคโนโลยี',
    users: '1-20',
    email: `qa.${sfx}@qa-${sfx}.co.th`, // unique domain: one account per email domain
    firstName: 'QA',
    lastName: `Auto ${sfx}`,
    phone: FIXED.phone,
    acceptTerms: true,
    ...overrides,
  };
}

module.exports = { FIXED, MSG, newRegistration };
