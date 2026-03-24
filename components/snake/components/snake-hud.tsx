"use client";

import { Share2 } from "lucide-react";

type SnakeHudProps = {
  scoreLabel: string;
  bestScoreLabel: string;
  pauseLabel: string;
  pausedLabel: string;
  shareLabel: string;
  onPause: () => void;
  onShare: () => void;
  isPaused: boolean;
};

export function SnakeHud({
  scoreLabel,
  bestScoreLabel,
  pauseLabel,
  pausedLabel,
  shareLabel,
  onPause,
  onShare,
  isPaused,
}: SnakeHudProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-stone-200 bg-white/85 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">{scoreLabel}</span>
        <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">{bestScoreLabel}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPause}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
        >
          {isPaused ? pausedLabel : pauseLabel}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700"
        >
          <span className="inline-flex items-center gap-2">
            <Share2 size={16} />
            {shareLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
