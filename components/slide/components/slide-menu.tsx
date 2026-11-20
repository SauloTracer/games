"use client";

import { Play, Settings, Share2 } from "lucide-react";

type SlideMenuProps = {
  subtitle: string;
  /** Frase curta mostrada no lugar do subtítulo no celular. */
  tagline: string;
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
  tagline,
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
    <div className="flex w-full flex-col items-center justify-center gap-5 py-4 text-center min-[900px]:min-h-[480px] min-[900px]:gap-6 min-[900px]:py-6">
      <p className="max-w-xl whitespace-pre-line text-base leading-7 text-muted md:text-lg max-[899px]:hidden">{subtitle}</p>
      <p className="max-w-xl text-base font-semibold leading-6 text-ink min-[900px]:hidden">{tagline}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-lg bg-slide-soft px-3 py-1.5 text-sm font-semibold text-slide-ink">{bestTimeLabel}</span>
        <span className="rounded-lg bg-chip px-3 py-1.5 text-sm font-semibold text-ink">{bestMovesLabel}</span>
      </div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-3 min-[900px]:grid-cols-1">
        <button
          type="button"
          onClick={onPlay}
          className="col-span-2 inline-flex min-h-12 min-[900px]:col-span-1 items-center justify-center gap-2 rounded-xl bg-slide px-6 text-base font-bold text-ink transition hover:brightness-95"
        >
          <Play size={18} aria-hidden="true" />
          {playLabel}
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-3 text-[15px] font-semibold min-[900px]:px-6 min-[900px]:text-base text-ink transition hover:bg-chip"
        >
          <Settings size={18} aria-hidden="true" />
          {settingsLabel}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-3 text-[15px] font-semibold min-[900px]:px-6 min-[900px]:text-base text-ink transition hover:bg-chip"
        >
          <Share2 size={18} aria-hidden="true" />
          {shareLabel}
        </button>
      </div>
    </div>
  );
}
