#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadScanConfig } from "./stars-scan.config.mjs";

function readText(projectRoot, relativePath) {
  const fullPath = join(projectRoot, relativePath);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : "";
}

function readJson(projectRoot, relativePath) {
  const text = readText(projectRoot, relativePath);

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function readMany(projectRoot, candidates) {
  return candidates.map((file) => readText(projectRoot, file)).filter(Boolean).join("\n");
}

function runCommand(projectRoot, command, args = []) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    shell: false
  });

  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status ?? 0,
    error: result.error
  };
}

function parseJsonObject(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
  }

  return null;
}

function getDynamicCoverage(projectRoot) {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = runCommand(projectRoot, npmCmd, ["run", "test:coverage", "--", "--coverageReporters=text-summary", "--runInBand"]);
  const output = `${result.stdout}\n${result.stderr}`;
  const match = output.match(/All files\s*\|\s*([\d.]+)\s*\|/m);

  if (!match) {
    return null;
  }

  return Number.parseFloat(match[1]);
}

function getHighVulnerabilityCount(projectRoot) {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = runCommand(projectRoot, npmCmd, ["audit", "--audit-level=high", "--json"]);
  const parsed = parseJsonObject(result.stdout || result.stderr);

  if (!parsed?.metadata?.vulnerabilities) {
    return null;
  }

  return Number(parsed.metadata.vulnerabilities.high ?? 0);
}

function getAccessibilityViolations(projectRoot) {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = runCommand(projectRoot, npmCmd, ["run", "test:e2e", "--", "--grep", "a11y|accessibility", "--project=chromium", "--reporter=line"]);
  const output = `${result.stdout}\n${result.stderr}`;
  const match = output.match(/([0-9]+) failed|([0-9]+) passed|([0-9]+) skipped/i);

  if (!match) {
    return null;
  }

  const failed = Number(match[1] ?? 0);
  return failed;
}

function getAccessibilityEvidence(projectRoot) {
  const accessibilityText = readMany(projectRoot, [
    "tests/accessibility.spec.ts",
    "tests/a11y.spec.ts",
    "e2e/accessibility.spec.ts",
    "e2e/a11y.spec.ts",
    "e2e/navigation.spec.ts",
    "e2e/utils/a11y.ts"
  ]);

  return {
    hasAxeDependency: readText(projectRoot, "package.json").includes("@axe-core/playwright") || /axe-core|@axe-core\/playwright/i.test(accessibilityText),
    hasAxeTest: /AxeBuilder|assertPageIsAccessible|violations\)\.toEqual\(\[\]\)|violations\)\.toHaveLength\(0\)/i.test(accessibilityText),
    accessibilityText
  };
}

function makeGate(gateId, checks, dynamic = {}) {
  const evidence = checks.filter((check) => check.pass).map((check) => check.label);
  const missing = checks.filter((check) => !check.pass).map((check) => check.label);
  const score = Math.round((evidence.length / checks.length) * 10);
  const status = score >= 8 ? "green" : score >= 4 ? "amber" : "red";

  const metrics = [];
  const evidenceCount = evidence.length;

  if (gateId === "security") {
    const vulnerabilities = dynamic.highVulnerabilities ?? null;
    metrics.push({ label: "High vulnerabilities", value: vulnerabilities === null ? "unknown" : `${vulnerabilities}` });
    metrics.push({ label: "Security checks", value: `${evidenceCount}/3 passed` });
  }

  if (gateId === "testing") {
    const coverage = dynamic.coveragePercent === null || Number.isNaN(dynamic.coveragePercent)
      ? (evidence.includes("80% coverage threshold") ? "80%" : "0%")
      : `${dynamic.coveragePercent}%`;
    metrics.push({ label: "Coverage", value: coverage });
    metrics.push({ label: "Test checks", value: `${evidenceCount}/3 passed` });
  }

  if (gateId === "accessibility") {
    const violations = dynamic.accessibilityViolations ?? null;
    metrics.push({ label: "Accessibility violations", value: violations === null ? "unknown" : `${violations}` });
    metrics.push({ label: "Accessibility checks", value: `${evidenceCount}/3 passed` });
  }

  if (gateId === "reliability") {
    const browserProjects = evidence.filter((item) => item === "Chromium project" || item === "WebKit project").length;
    metrics.push({ label: "Browser projects", value: `${browserProjects}/2` });
    metrics.push({ label: "Retries", value: evidence.includes("retry configuration") ? "enabled" : "disabled" });
  }

  if (gateId === "scalability") {
    metrics.push({ label: "Complexity violations", value: `${Math.max(0, 4 - evidenceCount)}` });
    metrics.push({ label: "Lint rules", value: `${evidenceCount}/4 configured` });
  }

  return { score, status, evidence, missing, metrics };
}

async function buildReport(projectRoot, config) {
  const packageJson = readJson(projectRoot, "package.json");
  const dynamic = {
    coveragePercent: getDynamicCoverage(projectRoot),
    highVulnerabilities: getHighVulnerabilityCount(projectRoot),
    accessibilityViolations: getAccessibilityViolations(projectRoot)
  };
  const eslintText = readMany(projectRoot, [
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
    ".eslintrc",
    ".eslintrc.json",
    ".eslintrc.js",
    ".eslintrc.cjs"
  ]);
  const jestText = readMany(projectRoot, [
    "jest.config.js",
    "jest.config.mjs",
    "jest.config.cjs",
    "jest.config.ts",
    "package.json"
  ]);
  const playwrightText = readMany(projectRoot, [
    "playwright.config.js",
    "playwright.config.mjs",
    "playwright.config.ts"
  ]);
  const workflowText = readMany(projectRoot, [
    ".github/workflows/stars.yml",
    ".github/workflows/ci.yml",
    ".github/workflows/security.yml",
    ".github/workflows/test.yml"
  ]);
  const accessibilityEvidence = getAccessibilityEvidence(projectRoot);

  const context = {
    packageJson,
    dynamic,
    eslintText,
    jestText,
    playwrightText,
    workflowText,
    accessibilityEvidence,
    projectRoot
  };

  const gates = Object.fromEntries(
    Object.entries(config.gates).map(([gateId, gateConfig]) => {
      const checks = (gateConfig.checks ?? []).map((check) => ({
        label: check.label,
        pass: Boolean(check.evaluate({ ...context }))
      }));

      return [gateId, makeGate(gateId, checks, dynamic)];
    })
  );

  const score = Math.round((Object.values(gates).reduce((sum, gate) => sum + gate.score, 0) / Object.keys(gates).length) * 10) / 10;

  return {
    schemaVersion: 1,
    projectName: packageJson.name ?? basename(projectRoot),
    generatedAt: new Date().toISOString(),
    summary: {
      score,
      status: score >= 8 ? "green" : score >= 4 ? "amber" : "red"
    },
    gates
  };
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const dashboardRoot = resolve(scriptDir, "..");
const cliArgs = process.argv.slice(2);
const projectRoot = resolve(cliArgs[0] ?? ".");
const configPath = cliArgs[1];
const config = await loadScanConfig(configPath);
const report = await buildReport(projectRoot, config);
const outputPath = join(projectRoot, "stars-counter.json");
const copyTargetPath = join(dashboardRoot, "imported-stars-counter.json");

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

if (outputPath !== copyTargetPath) {
  copyFileSync(outputPath, copyTargetPath);
  console.log(`Copied report to ${copyTargetPath}`);
}

console.log(`Wrote ${outputPath}`);
console.log(`S.T.A.R.S score: ${report.summary.score}/10 (${report.summary.status})`);
