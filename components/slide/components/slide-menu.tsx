"use client";

import { Play, Settings, Share2 } from "lucide-react";

type SlideMenuProps = {
  subtitle: string;
  playLabel: string;
  settingsLabel: string;
  shareLabel: string;
  bestTimeLabel: string;
  bestMovesLabel: string;
  onPlay: () => void;
  onSettings: () => void;
  onShare: () => void;
};

export function SlideMenu({
  subtitle,
  playLabel,
  settingsLabel,
  shareLabel,
  bestTimeLabel,
  bestMovesLabel,
  onPlay,
  onSettings,
  onShare,
}: SlideMenuProps) {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-6 py-6 text-center md:min-h-[480px]">
      <p className="max-w-xl whitespace-pre-line text-base leading-7 text-muted md:text-lg">{subtitle}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-lg bg-slide-soft px-3 py-1.5 text-sm font-semibold text-slide-ink">{bestTimeLabel}</span>
        <span className="rounded-lg bg-chip px-3 py-1.5 text-sm font-semibold text-ink">{bestMovesLabel}</span>
      </div>

      <div className="grid w-full max-w-sm gap-3">
        <button
          type="button"
          onClick={onPlay}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slide px-6 text-base font-bold text-ink transition hover:brightness-95"
        >
          <Play size={18} aria-hidden="true" />
          {playLabel}
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-6 text-base font-semibold text-ink transition hover:bg-chip"
        >
          <Settings size={18} aria-hidden="true" />
          {settingsLabel}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-6 text-base font-semibold text-ink transition hover:bg-chip"
        >
          <Share2 size={18} aria-hidden="true" />
          {shareLabel}
        </button>
      </div>
    </div>
  );
}
