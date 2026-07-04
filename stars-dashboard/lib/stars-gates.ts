export type GateId = "security" | "testing" | "accessibility" | "reliability" | "scalability";

export type GateStage = "red" | "amber" | "green";

export type StarsGate = {
  id: GateId;
  letter: "S" | "T" | "A" | "R";
  name: string;
  shortName: string;
  check: string;
  redReason: string;
  amberReason: string;
  greenReason: string;
};

export type GateScore = Record<GateId, number>;

export const starsGates: StarsGate[] = [
  {
    id: "security",
    letter: "S",
    name: "Security-First",
    shortName: "Security",
    check: "npm audit at high severity, eslint-plugin-security, and a gitleaks secret-scan job.",
    redReason: "No security scanners are represented yet, so the scaffold starts with unknown risk.",
    amberReason: "The sample security gate has been acknowledged, but secret scanning and audit enforcement still need proof.",
    greenReason: "The sample security gate now represents audit, static security linting, and secret scanning coverage."
  },
  {
    id: "testing",
    letter: "T",
    name: "Test Coverage",
    shortName: "Tests",
    check: "Jest unit tests and Playwright E2E coverage enforced at an 80% threshold.",
    redReason: "No tests or coverage threshold are represented yet, so confidence is intentionally low.",
    amberReason: "The sample test gate has basic intent, but it has not reached the 80% coverage bar.",
    greenReason: "The sample test gate now represents unit, E2E, and coverage threshold readiness."
  },
  {
    id: "accessibility",
    letter: "A",
    name: "Accessibility",
    shortName: "Accessibility",
    check: "eslint-plugin-jsx-a11y plus a runtime axe hard gate with zero WCAG 2a/2aa/21aa violations.",
    redReason: "No static or runtime accessibility checks are represented yet.",
    amberReason: "The sample accessibility gate has static intent, but runtime axe proof is still missing.",
    greenReason: "The sample accessibility gate now represents static and runtime zero-violation checks."
  },
  {
    id: "reliability",
    letter: "R",
    name: "Reliability",
    shortName: "Reliability",
    check: "Playwright runs across Chromium and WebKit with retries enabled.",
    redReason: "No cross-browser execution or retry behavior is represented yet.",
    amberReason: "The sample reliability gate has browser coverage intent, but retries and repeatability are not complete.",
    greenReason: "The sample reliability gate now represents cross-browser runs with retries."
  },
  {
    id: "scalability",
    letter: "S",
    name: "Scalability",
    shortName: "Maintainability",
    check: "ESLint complexity, max-depth, max-lines-per-function, and max-params gates.",
    redReason: "No maintainability limits are represented yet, so future features could become hard to add.",
    amberReason: "The sample maintainability gate has limits in view, but the full rule set is not represented.",
    greenReason: "The sample maintainability gate now represents complexity, depth, function length, and parameter limits."
  }
];

export const initialGateScores: GateScore = {
  security: 0,
  testing: 0,
  accessibility: 0,
  reliability: 0,
  scalability: 0
};

export function getGateStage(score: number): GateStage {
  if (score >= 8) {
    return "green";
  }

  if (score >= 4) {
    return "amber";
  }

  return "red";
}

export function getGateColor(score: number): string {
  const stage = getGateStage(score);

  if (stage === "green") {
    return "var(--green)";
  }

  if (stage === "amber") {
    return "var(--amber)";
  }

  return "var(--red)";
}

export function getGateReason(gate: StarsGate, score: number): string {
  const stage = getGateStage(score);

  if (stage === "green") {
    return gate.greenReason;
  }

  if (stage === "amber") {
    return gate.amberReason;
  }

  return gate.redReason;
}

export function getAverageScore(scores: GateScore): number {
  const total = starsGates.reduce((sum, gate) => sum + scores[gate.id], 0);
  return Math.round((total / starsGates.length) * 10) / 10;
}

export function advanceGate(score: number): number {
  if (score >= 10) {
    return 10;
  }

  if (score >= 5) {
    return 10;
  }

  return 5;
}
