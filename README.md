# empeo Registration – Automation Tests

Automated tests for the **empeo free-trial registration** flow on Gofive UAT
(https://portal.uat.gofive.co.th/Register/empeo), written with **Playwright Test (JavaScript)**.

Covers: successful registration, OTP verification, promo code validation, required fields / error handling,
and edge cases (invalid phone, expired OTP, reused promo code).
**24 test cases → 35 automated test runs.** Case design: [`docs/TEST_CASES.md`](docs/TEST_CASES.md) (Gherkin) and `docs/TEST_CASES.xlsx`.

## Quick start

Requirements: Node.js 20+ and Git.

```bash
git clone <this-repo-url>
cd empeo-registration-tests
npm ci
npx playwright install chromium
npx playwright test            # run everything (headless, 3 workers)
npx playwright show-report     # open the HTML report
```

Windows PowerShell: if `npm`/`npx` is blocked by the execution policy, use `npm.cmd` / `npx.cmd`.

| Command | What it does |
|---|---|
| `npm test` | all tests, headless |
| `npm run test:smoke` | only `@smoke` tests (fast check, ~6 tests) |
| `npm run test:headed` | all tests in a visible browser, one at a time |
| `npm run test:video` | one at a time, records **video + trace + screenshot for every test** (`playwright.video.config.js`) |
| `npx playwright test tests/otp.spec.js` | one file |
| `npx playwright test -g "TC-PRM"` | by case ID |
| `npm run report` | open the last HTML report (videos/traces are attached per test) |

Optional `.env` (copy from `.env.example`): `BASE_URL`, `TEST_PHONE`, `TEST_OTP`, `PROMO_CODE`, `TEST_TIMEOUT`.
Defaults are the values from the brief, so no `.env` is needed.

CI: `.github/workflows/playwright.yml` runs the suite on every push / pull request and uploads the HTML report.

## Project structure

```
empeo-registration-tests/
├── playwright.config.js          # base URL, timeouts, reporters, trace/video on failure
├── playwright.video.config.js    # same suite, video for every test (submission video)
├── data/testData.js              # fixed data from the brief + unique data factory + UI messages
├── fixtures/test.js              # page objects and a fresh `user` injected into every test
├── pages/
│   ├── RegisterPage.js           # registration form
│   ├── OtpDialog.js              # OTP dialog (6 boxes, verify, resend countdown)
│   └── CreatePasswordPage.js     # set-password step + success screen
├── tests/
│   ├── registration.spec.js      # TC-REG  happy path end to end
│   ├── otp.spec.js               # TC-OTP  OTP flow
│   ├── promo.spec.js             # TC-PRM  promo code
│   ├── validation.spec.js        # TC-VAL  required fields / formats / consent
│   └── phone.edge.spec.js        # TC-EDGE phone edge cases
├── docs/
│   ├── TEST_CASES.md / .xlsx     # test case design
│   ├── AI_USAGE.md               # how AI was used
│   └── exploration/              # screenshots from exploring the page
└── .github/workflows/playwright.yml
```

## Design decisions

- **Page Object Model + fixtures.** Tests read like the test case; locators live in one place.
  `registerPage` fixture opens the page; `user` fixture gives each test unique valid data.
- **Stable locators.** The app ships `data-testid` attributes, so `getByTestId` is used first;
  visible text / placeholder only where no test id exists (dropdowns, phone input).
- **Unique data per test.** The system blocks a company name or e-mail **domain** that already exists,
  so every test gets a unique company name and a unique domain (`qa.<id>@qa-<id>.co.th`). Tests run in parallel safely.
- **Web-first assertions only, no fixed sleeps.** e.g. the resend test waits for the link to appear (up to 40 s) instead of sleeping 30 s.
- **UI + API checks together.** TC-REG-01 checks the body of `POST /api/v2/register` (couponCode, phone in +66 format);
  TC-PRM-01 checks the `coupon-validation` response; validation tests prove **no register request is sent**.
- **Expired OTP is simulated** (`page.route` on `verify-otp`) because the expiry time is not documented and cannot be forced
  from the UI. The test checks the UI reaction (error shown, user not let through). Marked "simulated" in the case design.
- **Account creation is limited.** Only TC-REG-01 completes an account; other tests stop before the final step to keep UAT data small.

## Test results

Run on 27 Oct 2026, Windows 11, Playwright 1.64.1 / Chromium, against UAT:

| Run | Result | Duration |
|---|---|---|
| `npx playwright test` (4 workers) | **35 passed, 0 failed** | 2.2 min |
| `npm run test:video` (video + trace for every test) | see `docs/demo/` | – |

Screenshots of the HTML report: `docs/report/`. Recorded run: `docs/demo/automation-run.mp4`.

## Findings (observed on UAT, 27 Oct 2026)

| # | Finding | Severity | Test |
|---|---|---|---|
| F-01 | Submitting without ticking the consent box does nothing and shows **no message**; the user is not told why. | Medium (UX) | TC-VAL-05 |
| F-02 | Password mismatch: "ตั้งรหัสผ่าน" stays **enabled** (only the inline message "รหัสผ่านไม่ตรงกัน" is shown). Other rules disable the button. Inconsistent. | Low | TC-REG-03 |
| F-03 | Phone field accepts `-` and up to 15 characters; validation only shows "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" on submit. | Low | TC-EDGE-02/03 |
| F-04 | FREE15DAY is a **multi-use** code (usageCount > 3,000, isLock=false). A "reused promo code is rejected" rule can't be tested with it; a single-use code is needed. | Info | TC-PRM-04 |
| F-05 | The same phone (0967690708) can register many companies; no duplicate-phone block on UAT. | Info (confirm with PO) | TC-REG-01 |
| F-06 | Wrong OTP: API returns HTTP 200 with business code 4001/E4001 (error in body, not HTTP status). | Info | TC-OTP-02 |

## Assumptions

- UAT uses fixed OTP `123456` for every request (confirmed: resent OTPs also accept it).
- "Expired OTP" and "reused promo code" behaviour is taken from the brief; see F-04 and TC-OTP-07 for how each is covered.
- Thai UI language (default). Messages are kept in `data/testData.js`, so another locale only needs that file changed.

## Limitations / next steps

- Add the "บริษัทจดทะเบียนในไทย" path once a test tax ID is available.
- Get the real OTP expiry time (or a test hook) to replace the simulated TC-OTP-07.
- Add an API-level suite for `/api/v2/register*` (faster, more negative cases), cross-browser projects, and test data clean-up for created UAT accounts.

## AI usage

AI tools were used to speed up parts of this work; details in [`docs/AI_USAGE.md`](docs/AI_USAGE.md).
All tests were run and checked against the real UAT page.
