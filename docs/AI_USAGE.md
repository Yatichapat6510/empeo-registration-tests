# AI usage

HR confirmed that AI tools may be used for this exam part. This page explains what AI did and what I checked.

| Tool | What it was used for | What I checked or decided |
|---|---|---|
| Claude (Claude app, agent mode with access to my PC) | Explored the registration page with Playwright scripts (fields, `data-testid`s, API calls, OTP dialog, messages); drafted the test case design, page objects, specs, README and this file; ran the suite on my machine | I set the scope and the output format, reviewed the test cases against the brief, read every spec, checked the failures it found and fixed (5 on the first run, all caused by wrong assumptions about the page), and watched the headed run |
| Playwright tools (not AI) | `codegen`/trace viewer/HTML report to confirm locators and results | – |

How the result was verified:
- Every expected message and behaviour in the tests was first **observed on the real UAT page** (screenshots in `docs/exploration/`), not guessed.
- The suite was run end to end on my machine against UAT: 35/35 passed; then re-run with video recording.
- Two areas are documented as limitations instead of being forced: expired OTP (simulated response) and reused promo (FREE15DAY is multi-use).

No passwords, tokens or personal data were shared with AI tools; the only data used is the test data given in the brief and generated test data.

<!-- Edit this page so it matches exactly what you did. -->
