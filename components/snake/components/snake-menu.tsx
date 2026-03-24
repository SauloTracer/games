"use client";

import { Share2 } from "lucide-react";

type SnakeMenuProps = {
  title: string;
  subtitle: string;
  playLabel: string;
  settingsLabel: string;
  shareLabel: string;
  onPlay: () => void;
  onSettings: () => void;
  onShare: () => void;
  bestScoreLabel: string;
  statusMessage?: string;
};

export function SnakeMenu({
  title,
  subtitle,
  playLabel,
  settingsLabel,
  shareLabel,
  onPlay,
  onSettings,
  onShare,
  bestScoreLabel,
  statusMessage,
}: SnakeMenuProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur md:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-900 md:text-6xl">{title}</h1>
        <p className="mt-4 whitespace-pre-line text-base leading-7 text-stone-600 md:text-lg">{subtitle}</p>
        <p className="mt-6 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
          {bestScoreLabel}
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-xl gap-3">
        <button
          type="button"
          onClick={onPlay}
          className="rounded-2xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-emerald-700"
        >
          {playLabel}
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="rounded-2xl bg-stone-100 px-6 py-4 text-base font-semibold text-stone-700 transition hover:bg-stone-200"
        >
          {settingsLabel}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="rounded-2xl border border-stone-300 bg-white px-6 py-4 text-base font-semibold text-stone-700 transition hover:border-stone-400"
        >
          <span className="inline-flex items-center gap-2">
            <Share2 size={18} />
            {shareLabel}
          </span>
        </button>
      </div>
      {statusMessage ? (
        <p className="mx-auto mt-4 max-w-xl text-center text-sm font-semibold leading-6 text-emerald-700">
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}
