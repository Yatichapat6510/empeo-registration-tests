# empeo registration: test case design

- **System under test:** https://portal.uat.gofive.co.th/Register/empeo (UAT, Thai locale)
- **Fixed test data (from the brief):** phone **0967690708**, OTP **123456**, promo **FREE15DAY**.
- **Other data** is generated for each test: a unique company name and a unique e-mail domain. They must be unique because the system allows only one account per e-mail domain.

The same cases are in `TEST_CASES.xlsx`, in step-by-step format, with Test Plan & Summary and Bug Report sheets.
Each case ID below is used in the automated test title, so the HTML report maps 1:1 to this document.

## Coverage summary

| Area (from the brief) | Case IDs | Automated | Priority |
|---|---|---|---|
| Successful registration with valid data | TC-REG-01 to TC-REG-03 | 3 of 3 | High |
| OTP verification flow | TC-OTP-01 to TC-OTP-08 | 8 of 8 (TC-OTP-07 uses a simulated server response) | High |
| Promo code validation | TC-PRM-01 to TC-PRM-04 | 4 cases, 6 runs | High / Medium |
| Required fields and error handling | TC-VAL-01 to TC-VAL-05 | 5 cases, 12 runs | High / Medium |
| Edge cases: phone number | TC-EDGE-01 to TC-EDGE-04 | 4 cases, 6 runs | Medium / Low |
| **Total** | **24 cases** | **35 test runs** | |

## Gherkin

```gherkin
Feature: empeo free-trial registration
  As a company owner
  I want to register for an empeo free trial
  So that I can start using empeo

  Background:
    Given I open the empeo registration page
    And I choose company type "อื่นๆ" (Other)

  # ---------- Successful registration ----------
  @smoke @e2e @high
  Scenario: TC-REG-01 Register with valid data and promo code
    When I fill company name, business type "เทคโนโลยี", users "1-20", a unique e-mail, first name, last name
    And I enter phone "0967690708"
    And I apply promo code "FREE15DAY"
    And I accept the privacy policy and terms
    And I click "ทดลองใช้ฟรี"
    Then the OTP dialog shows "โปรดกรอกรหัส OTP ที่ถูกส่งไปยัง 096-XXX-0708" and a ref number
    And the register request contains my data and couponCode "FREE15DAY"
    When I enter OTP "123456" and click "ยืนยัน"
    Then I am on the "กรุณาตั้งรหัสผ่าน" page
    When I set password "QaAuto12345" and confirm it
    Then I see "empeo พร้อมใช้งานแล้ว!" and the button "เริ่มต้นใช้งาน"

  @smoke @high
  Scenario: TC-REG-02 Register without a promo code (promo is optional)
    When I fill all required fields with valid data, without a promo code, and submit
    Then the OTP dialog is shown and "ยืนยัน" is disabled until an OTP is typed

  @high
  Scenario: TC-REG-03 Set-password rules
    Given I passed OTP verification
    When I type a password that breaks a rule ("abc", "abcdefgh", "ABCDEFGH1", "Abcdefgh", "Ab1")
    Then "ตั้งรหัสผ่าน" stays disabled
    When the confirmation does not match
    Then I see "รหัสผ่านไม่ตรงกัน" and stay on the page after clicking "ตั้งรหัสผ่าน"
    When password and confirmation are both "QaAuto12345"
    Then "ตั้งรหัสผ่าน" is enabled

  # ---------- OTP ----------
  @smoke @high
  Scenario: TC-OTP-01 Correct OTP
    Given the OTP dialog is open
    When I enter "123456" and click "ยืนยัน"
    Then I am redirected to /Register/empeo/create-password?token=...

  @high
  Scenario: TC-OTP-02 Wrong OTP
    When I enter "000000" and click "ยืนยัน"
    Then a toast shows "OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
    And I stay on the OTP dialog with empty OTP boxes

  @high
  Scenario: TC-OTP-03 Retry with the correct OTP after a wrong one
    When I enter a wrong OTP, then "123456"
    Then I reach the set-password page

  @medium
  Scenario: TC-OTP-04 Verify button needs 6 digits
    Then "ยืนยัน" is disabled with 0 and 5 digits and enabled with 6 digits

  @medium
  Scenario: TC-OTP-05 OTP accepts digits only
    When I type "ab!@cd" into the OTP boxes
    Then the boxes stay empty and "ยืนยัน" is disabled

  @high
  Scenario: TC-OTP-06 Resend OTP
    Then I see "รับ OTP ใหม่อีกครั้งได้ใน 0:30" and no resend link
    When the 30-second countdown ends
    Then I see "ส่งใหม่อีกครั้ง"
    When I click it
    Then a new ref number is shown, the countdown restarts, and OTP "123456" still works

  @high @simulated
  Scenario: TC-OTP-07 Expired OTP
    Given the server answers verify-otp with a business error (expired)
    When I enter "123456"
    Then an error toast is shown and I am not redirected

  @low
  Scenario: TC-OTP-08 Close the OTP dialog
    When I close the OTP dialog
    Then I am back on the form and my e-mail and phone are kept

  # ---------- Promo code ----------
  @smoke @high
  Scenario: TC-PRM-01 Valid promo code
    When I click "ใช้โค้ดส่วนลด", enter "FREE15DAY" and click "ใช้โค้ด"
    Then coupon-validation returns isValid=true and the code is shown as applied

  @high
  Scenario Outline: TC-PRM-02 Invalid promo code
    When I apply promo code "<code>"
    Then I see "คูปองโค้ดไม่ถูกต้อง"
    Examples:
      | code       |
      | INVALID999 |
      | FREE15DAYX |
      | 12345      |

  @medium
  Scenario: TC-PRM-03 Correct an invalid code
    When I apply "WRONGCODE" and then "FREE15DAY"
    Then the error disappears and "FREE15DAY" is applied

  @medium
  Scenario: TC-PRM-04 Reused promo code
    Given "FREE15DAY" was applied in one registration
    When another registration applies "FREE15DAY"
    Then it is accepted again (multi-use campaign code: isLock=false, usageCount > 3,000)

  # ---------- Required fields & error handling ----------
  @smoke @high
  Scenario: TC-VAL-01 Empty form
    When I click "ทดลองใช้ฟรี" without filling anything
    Then I see "กรุณากรอกประเภทธุรกิจ", "กรุณากรอกผู้ใช้งาน", "กรุณากรอกอีเมล", "กรุณากรอกชื่อ", "กรุณากรอกนามสกุล"
    And no register request is sent

  @high
  Scenario Outline: TC-VAL-02 One required field missing
    When I fill everything except <field> and submit
    Then I see "<message>" and no register request is sent
    Examples:
      | field        | message               |
      | email        | กรุณากรอกอีเมล         |
      | firstName    | กรุณากรอกชื่อ          |
      | lastName     | กรุณากรอกนามสกุล       |
      | businessType | กรุณากรอกประเภทธุรกิจ   |
      | users        | กรุณากรอกผู้ใช้งาน       |

  @medium
  Scenario Outline: TC-VAL-03 Invalid e-mail format
    When I enter e-mail "<email>" and submit
    Then I see "กรุณาใส่อีเมลที่ถูกต้อง"
    Examples:
      | email          |
      | not-an-email   |
      | qa@            |
      | @qa-test.co.th |
      | qa@qa-test     |

  @medium
  Scenario: TC-VAL-04 E-mail domain already registered
    When I enter an e-mail on domain "example.com" and submit
    Then I see "โดเมนนี้มีบัญชีใช้งานแล้ว" and no register request is sent

  @high
  Scenario: TC-VAL-05 Terms not accepted
    When I fill valid data but do not tick the consent box, and submit
    Then no register request is sent and the OTP dialog does not open

  # ---------- Edge cases: phone ----------
  @medium
  Scenario Outline: TC-EDGE-01 Invalid phone number
    When I enter phone "<phone>" and submit
    Then I see "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" and the OTP dialog does not open
    Examples:
      | phone       | note      |
      | 12345       | too short |
      | 096769070   | 9 digits  |
      | 09676907089 | 11 digits |

  @low
  Scenario: TC-EDGE-02 Letters in phone
    When I type "abcXYZ" into the phone field
    Then the field stays empty

  @low
  Scenario: TC-EDGE-03 Phone max length
    When I type 20 digits
    Then only the first 15 are kept

  @medium
  Scenario: TC-EDGE-04 Phone empty
    When I leave phone empty and submit
    Then the OTP dialog does not open
```

## Out of scope / not automated
- **"บริษัทจดทะเบียนในไทย" path:** the tax-ID lookup needs a real tax ID. The "อื่นๆ" path calls the same register API.
- **Real OTP expiry time:** not documented and cannot be forced from the UI. TC-OTP-07 simulates the server answer instead.
- **Single-use promo codes:** none were provided. FREE15DAY is multi-use (see TC-PRM-04).
- **SMS delivery itself:** UAT uses the fixed OTP 123456.
