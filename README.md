# S.T.A.R.S Next.js Dashboard

S.T.A.R.S stands for **Security-First, Test-Driven, Accessible, Reliable, Scalable**.

S.T.A.R.S is the framework. This repository is a **Next.js proof of concept** that demonstrates how to generate and visualize a project quality report using that framework.

The package supports both:

1. a React dashboard UI
2. a scanner CLI that can be adapted for other stacks

If your project is Angular, .NET, or another stack, use scanner mode with a custom config profile.

This project gives you two things:

1. A dashboard UI that renders a project quality report.
2. A scanner that generates that report from a target codebase.

The report file is `stars-counter.json`. The UI reads it and shows both readiness and implementation evidence across the five gates.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Main Workflows

### 1. Use this repo as the dashboard

Generate a report for this repo:

```bash
npm run stars:scan
```

That writes this repo’s local `stars-counter.json`.

### 2. Scan another project and show it here

```bash
npm run stars:outsource-scan -- /path/to/another/project
```

That will:

1. generate `/path/to/another/project/stars-counter.json`
2. copy that report into this repo as `imported-stars-counter.json`

This keeps this repo’s own self-report separate from imported scans.

### 3. Use the dashboard as a package

Install from a local path:

```bash
npm install ../path/to/stars-dashboard
```

Render it in another app:

```tsx
import { StarsDashboard } from "stars-dashboard";

export default function Page() {
  return <StarsDashboard />;
}
```

Run the scanner from the installed package:

```bash
npx stars-scan .
```

### 4. Use scanner mode in non-Next projects

You do not need Next.js to use the scanner.

Use a custom scan profile to map your own commands and checks into the S.T.A.R.S gates:

```bash
node scripts/stars-counter.mjs /path/to/project /path/to/your-config.mjs
```

For example, Angular or .NET projects can point checks to their own test, lint, audit, and accessibility tooling.

## What The Dashboard Shows

The UI has two views:

- **Readiness**: whether the project has the expected guardrails and setup.
- **Implementation**: what the project’s tools actually reported when executed.

Examples of implementation evidence include:

- `npm audit` results
- Jest coverage
- Playwright accessibility outcomes
- configured browser coverage and retries
- maintainability rules from lint config

## Scoring Model

Each gate is scored from `0` to `10`.

- `0-3`: red
- `4-7`: amber
- `8-10`: green

The five gates are:

- `security`
- `testing`
- `accessibility`
- `reliability`
- `scalability`

## Tooling Notes

The default scanner profile is intentionally opinionated for a **recommended Next.js workflow**.

By default it looks for tools such as:

- npm audit
- ESLint
- `eslint-plugin-security`
- `eslint-plugin-jsx-a11y`
- Jest
- Playwright
- axe-based runtime accessibility checks
- Gitleaks-style secret scanning

This is **not exhaustive** and **not mandatory** for every stack. You can use different tools as long as you map them into the same gates.

## Customizing The Scanner

The scanner runner is in [scripts/stars-counter.mjs](scripts/stars-counter.mjs).

The default configurable profile is in [scripts/stars-scan.config.mjs](scripts/stars-scan.config.mjs).

If your stack uses different tools, add or replace checks there instead of rewriting the whole runner.

Example:

```js
export default {
  gates: {
    accessibility: {
      checks: [
        {
          label: "custom accessibility check",
          evaluate: ({ packageJson }) => Boolean(packageJson.name)
        }
      ]
    }
  }
};
```

Run with a custom config:

```bash
node scripts/stars-counter.mjs /path/to/project /path/to/your-config.mjs
```

## Agent Guidance

Automated code writers should follow the repo rules in [AGENTS.md](AGENTS.md).

That file defines the expectation that any code change must preserve or improve the S.T.A.R.S gates before the work is complete.
