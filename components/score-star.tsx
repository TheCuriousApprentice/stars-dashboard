"use client";

import { GateScore, getGateColor, starsGates } from "../lib/stars-gates";

type Point = {
  x: number;
  y: number;
};

type ScoreStarProps = {
  scores: GateScore;
};

const center: Point = { x: 300, y: 300 };
const outerRadius = 205;
const labelRadius = 252;
const rings = [2, 4, 6, 8, 10];

function pointAt(index: number, radius: number): Point {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
}

function polygonPoints(points: Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function ScoreStar({ scores }: ScoreStarProps) {
  const scorePoints = starsGates.map((gate, index) => pointAt(index, (outerRadius * scores[gate.id]) / 10));

  return (
    <svg
      className="score-star"
      role="img"
      viewBox="0 0 600 600"
      aria-label="S.T.A.R.S radar score map"
    >
      <g aria-hidden="true">
        {rings.map((ring) => (
          <polygon
            className="radar-ring"
            key={ring}
            points={polygonPoints(starsGates.map((_, index) => pointAt(index, (outerRadius * ring) / 10)))}
          />
        ))}
      </g>

      {starsGates.map((gate, index) => {
        const outer = pointAt(index, outerRadius);
        const label = pointAt(index, labelRadius);
        const score = scores[gate.id];
        const dot = pointAt(index, (outerRadius * score) / 10);

        return (
          <g key={gate.id}>
            <line className="radar-axis" x1={center.x} y1={center.y} x2={outer.x} y2={outer.y} />
            <circle className="axis-end" cx={outer.x} cy={outer.y} r="9" fill={getGateColor(score)}>
              <title>{`${gate.name}: ${score} out of 10`}</title>
            </circle>
            <circle className="score-dot" cx={dot.x} cy={dot.y} r="11" />
            <text className="star-label" x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle">
              {gate.letter}
            </text>
          </g>
        );
      })}

      <polygon className="score-area" points={polygonPoints(scorePoints)} />
      <polyline className="score-line" points={`${polygonPoints(scorePoints)} ${scorePoints[0].x},${scorePoints[0].y}`} />
      <circle className="radar-origin" cx={center.x} cy={center.y} r="5" />
    </svg>
  );
}
