# AGENTS.md

This repository follows the S.T.A.R.S gates for every change: Security-First, Test-Driven, Accessible, Reliable, Scalable.

Automated code writers must satisfy these rules before considering work complete.

## Required gate checks

1. Security
Run or preserve `npm run security:audit`.
Do not add secrets, tokens, hard-coded credentials, or unsafe data handling.

2. Testing
Add or update tests for behavior changes.
Do not lower the Jest coverage threshold.

3. Accessibility
Preserve semantic HTML, keyboard access, and accessible names.
If UI changes affect rendering, ensure Playwright accessibility coverage still passes.

4. Reliability
Do not remove Playwright retries, browser coverage, or stable test setup.
Avoid introducing nondeterministic rendering or flaky async behavior.

5. Scalability
Keep ESLint maintainability limits green: `complexity`, `max-depth`, `max-lines-per-function`, and `max-params`.
Prefer small composable functions over large branches.

## Completion standard

Before finishing a task, automated agents should validate the narrowest relevant checks, then regenerate the local S.T.A.R.S report with:

```bash
node scripts/stars-counter.mjs .
```

If a change causes a gate to regress, the work is not complete.