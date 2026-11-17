"use client";

import { Stat, StatRow } from "@/components/game-layout";

type SnakeHudProps = {
  scoreTitle: string;
  bestTitle: string;
  score: number;
  bestScore: number;
};

export function SnakeHud({ scoreTitle, bestTitle, score, bestScore }: SnakeHudProps) {
  return (
    <StatRow>
      <Stat label={scoreTitle} value={score} />
      <Stat label={bestTitle} value={bestScore} align="end" />
    </StatRow>
  );
}
