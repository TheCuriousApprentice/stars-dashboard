# Contributing

Thanks for contributing to the S.T.A.R.S dashboard and scanner.

## Development setup

```bash
npm install
npm run dev
```

## Required checks before PR

```bash
npm run typecheck
npm run lint
npm run test:run
node scripts/stars-counter.mjs .
```

## Contribution expectations

- Keep changes scoped and focused.
- Add or update tests for behavior changes.
- Preserve S.T.A.R.S gate quality.
- Avoid introducing secrets, credentials, or tokens.

## Pull requests

Use the PR template and include reproduction/validation details.
