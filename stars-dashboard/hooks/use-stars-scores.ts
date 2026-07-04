"use client";

import { useMemo, useState } from "react";
import { advanceGate, GateId, GateScore } from "../lib/stars-gates";
import { reportGateScores } from "../lib/stars-report";

export function useStarsScores() {
  const [scores, setScores] = useState<GateScore>(reportGateScores);

  return useMemo(
    () => ({
      scores,
      improveGate: (id: GateId) => {
        setScores((current) => ({
          ...current,
          [id]: advanceGate(current[id])
        }));
      },
      resetScores: () => {
        setScores(reportGateScores);
      }
    }),
    [scores]
  );
}
