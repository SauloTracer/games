"use client";

import { Stat, StatRow } from "@/components/game-layout";

type SlideHudProps = {
  timeTitle: string;
  movesTitle: string;
  time: string;
  moves: number;
};

export function SlideHud({ timeTitle, movesTitle, time, moves }: SlideHudProps) {
  return (
    <StatRow>
      <Stat label={timeTitle} value={time} />
      <Stat label={movesTitle} value={moves} align="end" />
    </StatRow>
  );
}
