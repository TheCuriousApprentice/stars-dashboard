import starsCounter from "../stars-counter.json";
import { GateId, GateScore, getAverageScore, getGateStage, initialGateScores } from "./stars-gates";

export type GateMetric = {
  label: string;
  value: string;
};

export type StarsCounterGate = {
  score: number;
  status: "red" | "amber" | "green";
  evidence: string[];
  missing: string[];
  metrics: GateMetric[];
};

export type StarsCounterReport = {
  schemaVersion: number;
  projectName: string;
  generatedAt: string;
  summary: {
    score: number;
    status: "red" | "amber" | "green";
  };
  gates: Record<GateId, StarsCounterGate>;
};

export const starsReport = starsCounter as StarsCounterReport;

export const reportGateScores: GateScore = {
  ...initialGateScores,
  security: starsReport.gates.security.score,
  testing: starsReport.gates.testing.score,
  accessibility: starsReport.gates.accessibility.score,
  reliability: starsReport.gates.reliability.score,
  scalability: starsReport.gates.scalability.score
};

export const reportSummary = {
  score: getAverageScore(reportGateScores),
  status: getGateStage(getAverageScore(reportGateScores))
};
