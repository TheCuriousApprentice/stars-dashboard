"use client";

import { useState } from "react";
import { useStarsScores } from "../hooks/use-stars-scores";
import { getGateColor, getGateReason, getGateStage, starsGates } from "../lib/stars-gates";
import { starsReport } from "../lib/stars-report";

const stageLabel = {
  red: "Red",
  amber: "Amber",
  green: "Green"
};

function GateMetrics({ gateId }: { gateId: keyof typeof starsReport.gates }) {
  return (
    <ul className="metric-list">
      {starsReport.gates[gateId].metrics.map((metric) => (
        <li key={`${gateId}-${metric.label}`}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </li>
      ))}
    </ul>
  );
}

function GateDetails({ gateId }: { gateId: keyof typeof starsReport.gates }) {
  return (
    <div className="details-panel">
      <div>
        <h4>Missing</h4>
        <p>{starsReport.gates[gateId].missing.join(", ") || "Nothing missing in the latest report."}</p>
      </div>
      <div>
        <h4>Evidence</h4>
        <p>{starsReport.gates[gateId].evidence.join(", ") || "No evidence found yet."}</p>
      </div>
    </div>
  );
}

function GateExplanationCard({ gateId, score, stage, expanded, onToggle }: {
  gateId: keyof typeof starsReport.gates;
  score: number;
  stage: keyof typeof stageLabel;
  expanded: boolean;
  onToggle: () => void;
}) {
  const gate = starsGates.find((item) => item.id === gateId);

  if (!gate) {
    return null;
  }

  return (
    <article className="gate-card" key={gate.id}>
      <header>
        <span className="gate-letter" style={{ background: getGateColor(score) }} aria-hidden="true">
          {gate.letter}
        </span>
        <div>
          <h3>{gate.name}</h3>
          <span className="status-pill" style={{ background: getGateColor(score) }}>
            {stageLabel[stage]} · {score}/10
          </span>
        </div>
      </header>

      <div>
        <h4>Gate</h4>
        <p>{gate.check}</p>
      </div>

      <div>
        <h4>Current state</h4>
        <p>{getGateReason(gate, score)}</p>
      </div>

      <div>
        <h4>Implementation metrics</h4>
        <GateMetrics gateId={gateId} />
      </div>

      <div>
        <h4>Report evidence</h4>
        <p>{starsReport.gates[gateId].evidence.join(", ") || "No evidence found yet."}</p>
      </div>

      <button className="details-toggle" type="button" onClick={onToggle}>
        {expanded ? "Hide details" : "Show violations"}
      </button>

      {expanded ? <GateDetails gateId={gateId} /> : null}
    </article>
  );
}

export function StarsExplanation() {
  const { scores } = useStarsScores();
  const [expandedGate, setExpandedGate] = useState<string | null>(null);

  return (
    <>
      <section className="page-heading" aria-labelledby="explain-title">
        <p className="eyebrow">Framework guidance</p>
        <h2 id="explain-title">How this report maps to each gate.</h2>
        <p>
          This view is driven by <code>stars-counter.json</code>. Each gate below explains how the current score maps
          to the latest report and what evidence is present or still missing.
        </p>
      </section>

      <section className="explain-layout" aria-label="Gate explanations">
        {starsGates.map((gate) => {
          const score = scores[gate.id];
          const stage = getGateStage(score);

          return (
            <GateExplanationCard
              key={gate.id}
              gateId={gate.id}
              score={score}
              stage={stage}
              expanded={expandedGate === gate.id}
              onToggle={() => setExpandedGate((current) => (current === gate.id ? null : gate.id))}
            />
          );
        })}
      </section>
    </>
  );
}
