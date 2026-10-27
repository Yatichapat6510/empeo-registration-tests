# AI usage

HR confirmed that AI tools may be used for this exam part. This page explains what AI did and what I checked.

| Tool | What it was used for | What I checked or decided |
|---|---|---|
| Claude (Claude app, agent mode with access to my PC) | Explored the registration page with Playwright scripts (fields, `data-testid`s, API calls, OTP dialog, messages); drafted the test case design, page objects, specs, README and this file; ran the suite on my machine; merged the per-test videos; built the test case workbook (Google Sheet) and organised the evidence in Google Drive | I set the scope and the output format (Agnos-style workbook), reviewed the test cases against the brief, read the specs, watched the headed run, and checked the results and evidence links |
| Claude Code (VS Code) | After my run at 16:47 failed 2 tests (TC-OTP-01, TC-OTP-03), used to stabilise the suite: wait up to 30 s for the set-password page, retry dropdown/checkbox clicks, 1 retry on UAT, an auto fixture that attaches HTTP errors to a failed test | I ran the suite, saw the 2 failures, checked the failure screenshot (the page opened late, so UAT was slow, not a wrong expectation), and confirmed the rerun: 35/35 passed, 0 flaky |
| Playwright tools (not AI) | HTML report, trace viewer and video to confirm locators and results | – |

How the result was verified:
- Every expected message and behaviour in the tests was first **observed on the real UAT page** (screenshots in `docs/exploration/`), not guessed.
- The suite was run end to end on my machine against UAT several times (history in README → Test results). The final run passed 35/35 with no flaky tests.
- Two areas are documented as limitations instead of being forced: expired OTP (simulated response) and reused promo code (FREE15DAY is multi-use).

No passwords, tokens or personal data were shared with AI tools; the only data used is the test data given in the brief and generated test data.
