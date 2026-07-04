import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

function hasDep(packageJson, names) {
  const installed = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {})
  };

  return names.some((name) => Boolean(installed[name]));
}

function hasScript(packageJson, matcher) {
  return Object.values(packageJson.scripts ?? {}).some((script) => matcher.test(script));
}

function hasFile(projectRoot, files) {
  return files.some((file) => existsSync(resolve(projectRoot, file)));
}

function hasAxeEvidence(accessibilityEvidence) {
  return accessibilityEvidence.hasAxeDependency || accessibilityEvidence.hasAxeTest;
}

function hasZeroViolations(dynamic, accessibilityEvidence) {
  if (dynamic.accessibilityViolations === null) {
    return accessibilityEvidence.hasAxeTest && /wcag2a|wcag2aa|wcag21aa/i.test(accessibilityEvidence.accessibilityText);
  }

  return dynamic.accessibilityViolations === 0;
}

function hasCoverageThreshold(dynamic, text) {
  if (dynamic.coveragePercent === null || Number.isNaN(dynamic.coveragePercent)) {
    return /coverageThreshold|very_good_coverage|80/.test(text);
  }

  return dynamic.coveragePercent >= 80;
}

function hasSecurityAudit(dynamic) {
  return dynamic.highVulnerabilities === null || dynamic.highVulnerabilities === 0;
}

export const defaultScanConfig = {
  name: "S.T.A.R.S default Next.js profile",
  gates: {
    security: {
      checks: [
        {
          label: "npm audit --audit-level=high script",
          evaluate: ({ packageJson, dynamic }) => hasScript(packageJson, /npm\s+audit\s+--audit-level=high/) && hasSecurityAudit(dynamic)
        },
        {
          label: "eslint-plugin-security dependency/configuration",
          evaluate: ({ packageJson, eslintText }) => hasDep(packageJson, ["eslint-plugin-security"]) || /security\//.test(eslintText)
        },
        {
          label: "gitleaks configuration or CI workflow",
          evaluate: ({ projectRoot, workflowText }) => hasFile(projectRoot, [".gitleaks.toml", "gitleaks.toml"]) || /gitleaks/i.test(workflowText)
        }
      ]
    },
    testing: {
      checks: [
        {
          label: "Jest dependency or configuration",
          evaluate: ({ packageJson, jestText }) => hasDep(packageJson, ["jest", "ts-jest", "next/jest"]) || /jest/i.test(jestText)
        },
        {
          label: "Playwright dependency or configuration",
          evaluate: ({ packageJson, playwrightText }) => hasDep(packageJson, ["@playwright/test"]) || Boolean(playwrightText.trim())
        },
        {
          label: "80% coverage threshold",
          evaluate: ({ dynamic, jestText }) => hasCoverageThreshold(dynamic, jestText)
        }
      ]
    },
    accessibility: {
      checks: [
        {
          label: "eslint-plugin-jsx-a11y dependency/configuration",
          evaluate: ({ packageJson, eslintText }) => hasDep(packageJson, ["eslint-plugin-jsx-a11y"]) || /jsx-a11y/.test(eslintText)
        },
        {
          label: "axe runtime accessibility dependency or test",
          evaluate: ({ packageJson, accessibilityEvidence }) => hasDep(packageJson, ["@axe-core/playwright", "axe-core", "jest-axe"]) || hasAxeEvidence(accessibilityEvidence)
        },
        {
          label: "zero-violation WCAG hard gate",
          evaluate: ({ dynamic, accessibilityEvidence }) => hasZeroViolations(dynamic, accessibilityEvidence)
        }
      ]
    },
    reliability: {
      checks: [
        {
          label: "Playwright configuration",
          evaluate: ({ playwrightText }) => Boolean(playwrightText.trim())
        },
        {
          label: "Chromium project",
          evaluate: ({ playwrightText }) => /chromium/i.test(playwrightText)
        },
        {
          label: "WebKit project",
          evaluate: ({ playwrightText }) => /webkit/i.test(playwrightText)
        },
        {
          label: "retry configuration",
          evaluate: ({ playwrightText }) => /retries\s*:\s*[1-9]/.test(playwrightText)
        }
      ]
    },
    scalability: {
      checks: [
        {
          label: "ESLint complexity rule",
          evaluate: ({ eslintText }) => /complexity/.test(eslintText)
        },
        {
          label: "ESLint max-depth rule",
          evaluate: ({ eslintText }) => /max-depth/.test(eslintText)
        },
        {
          label: "ESLint max-lines-per-function rule",
          evaluate: ({ eslintText }) => /max-lines-per-function/.test(eslintText)
        },
        {
          label: "ESLint max-params rule",
          evaluate: ({ eslintText }) => /max-params/.test(eslintText)
        }
      ]
    }
  }
};

export function mergeScanConfig(defaultConfig, overrideConfig = {}) {
  const mergedGates = { ...defaultConfig.gates, ...(overrideConfig.gates ?? {}) };

  return {
    ...defaultConfig,
    ...overrideConfig,
    gates: Object.fromEntries(
      Object.entries(mergedGates).map(([gateId, gateConfig]) => [
        gateId,
        {
          ...(defaultConfig.gates?.[gateId] ?? {}),
          ...(gateConfig ?? {}),
          checks: gateConfig?.checks ?? defaultConfig.gates?.[gateId]?.checks ?? []
        }
      ])
    )
  };
}

export async function loadScanConfig(configPath) {
  if (!configPath) {
    return defaultScanConfig;
  }

  const fullPath = resolve(configPath);
  const moduleUrl = pathToFileURL(fullPath).href;
  const imported = await import(moduleUrl);
  return mergeScanConfig(defaultScanConfig, imported?.default ?? imported);
}

export default defaultScanConfig;
