"use client";

import { useState } from "react";
import { useStarsScores } from "../hooks/use-stars-scores";
import { getAverageScore, getGateColor, starsGates } from "../lib/stars-gates";
import { starsReport } from "../lib/stars-report";
import { ScoreStar } from "./score-star";
import { StarsExplanation } from "./stars-explanation";

type ActiveTab = "readiness" | "implementation";

function GateScoreList({ scores }: { scores: ReturnType<typeof useStarsScores>["scores"] }) {
  return (
    <ul className="gate-list" aria-label="Gate scores">
      {starsGates.map((gate) => {
        const score = scores[gate.id];

        return (
          <li className="gate-row" key={gate.id}>
            <span className="gate-letter" style={{ background: getGateColor(score) }} aria-hidden="true">
              {gate.letter}
            </span>
            <span className="meter" aria-hidden="true">
              <span style={{ width: `${score * 10}%`, background: getGateColor(score) }} />
            </span>
            <span className="score-text">{gate.shortName}: {score}/10</span>
          </li>
        );
      })}
    </ul>
  );
}

function DashboardTabs({ activeTab, setActiveTab }: { activeTab: ActiveTab; setActiveTab: (tab: ActiveTab) => void }) {
  return (
    <div className="tab-row" role="tablist" aria-label="Dashboard views">
      <button
        className={`tab-button ${activeTab === "readiness" ? "active" : ""}`}
        type="button"
        role="tab"
        aria-selected={activeTab === "readiness"}
        onClick={() => setActiveTab("readiness")}
      >
        Readiness
      </button>
      <button
        className={`tab-button ${activeTab === "implementation" ? "active" : ""}`}
        type="button"
        role="tab"
        aria-selected={activeTab === "implementation"}
        onClick={() => setActiveTab("implementation")}
      >
        Implementation
      </button>
    </div>
  );
}

function SummaryPanel({ averageScore, scores, activeTab, setActiveTab }: { averageScore: number; scores: ReturnType<typeof useStarsScores>["scores"]; activeTab: ActiveTab; setActiveTab: (tab: ActiveTab) => void }) {
  return (
    <aside className="summary-panel" aria-label="Score summary">
      <div className="summary-card">
        <h2>Overall score</h2>
        <span className="summary-value">{averageScore}/10</span>
        <p>
          Project: <strong>{starsReport.projectName}</strong>. Generated from the checked-in report and locally
          adjustable in the explanation panel.
        </p>
      </div>

      <GateScoreList scores={scores} />
      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </aside>
  );
}

function ImplementationCards({ scores }: { scores: ReturnType<typeof useStarsScores>["scores"] }) {
  return (
    <div className="implementation-grid">
      {starsGates.map((gate) => {
        const reportGate = starsReport.gates[gate.id];
        const issueCount = reportGate.missing.length;

        return (
          <article key={`${gate.id}-implementation`} className="implementation-card">
            <header>
              <span className="gate-letter" style={{ background: getGateColor(scores[gate.id]) }} aria-hidden="true">
                {gate.letter}
              </span>
              <div>
                <h3>{gate.name}</h3>
                <p>{issueCount} issue{issueCount === 1 ? "" : "s"}</p>
              </div>
            </header>

            <ul className="metric-list">
              {reportGate.metrics.map((metric) => (
                <li key={`${gate.id}-${metric.label}`}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </li>
              ))}
            </ul>

            <div className="issue-list">
              {reportGate.missing.length > 0 ? (
                reportGate.missing.map((item) => <span key={`${gate.id}-${item}`} className="issue-pill">{item}</span>)
              ) : (
                <span className="issue-pill issue-pill-good">No open issues</span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ImplementationPanel({ averageScore, scores }: { averageScore: number; scores: ReturnType<typeof useStarsScores>["scores"] }) {
  return (
    <div className="implementation-panel">
      <div className="implementation-summary">
        <div className="summary-card">
          <h2>Quality signals</h2>
          <span className="summary-value">{averageScore}/10</span>
          <p>Live implementation evidence from the project’s checks and tool outputs.</p>
        </div>
        <div className="summary-card">
          <h2>Open issues</h2>
          <span className="summary-value summary-value-small">
            {starsGates.reduce((count, gate) => count + starsReport.gates[gate.id].missing.length, 0)}
          </span>
          <p>Missing or failing checks across the quality gates.</p>
        </div>
      </div>

      <ImplementationCards scores={scores} />
    </div>
  );
}

export function StarsDashboard() {
  const { scores } = useStarsScores();
  const averageScore = getAverageScore(scores);
  const [activeTab, setActiveTab] = useState<ActiveTab>("readiness");

  return (
    <>
      <section className="page-heading" aria-labelledby="dashboard-title">
        <p className="eyebrow">Framework score map</p>
        <h1 id="dashboard-title">S.T.A.R.S FRAMEWORK READINESS</h1>
        <p>
          This dashboard reads <code>stars-counter.json</code> and maps Security, Tests, Accessibility, Reliability,
          and Scalability onto a radar chart. Each point moves from the center toward the edge as its score improves.
        </p>
      </section>

      <section className="dashboard-grid" aria-label="S.T.A.R.S dashboard">
        <div className="star-panel">
          <ScoreStar scores={scores} />
        </div>

        <SummaryPanel averageScore={averageScore} scores={scores} activeTab={activeTab} setActiveTab={setActiveTab} />
      </section>

      <div className="explanation-panel">
        {activeTab === "readiness" ? <StarsExplanation /> : null}
        {activeTab === "implementation" ? <ImplementationPanel averageScore={averageScore} scores={scores} /> : null}
      </div>
    </>
  );
}
