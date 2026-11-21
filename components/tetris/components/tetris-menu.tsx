"use client";

import { Play, Settings } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type TetrisMenuProps = {
  bestScore: number;
  onPlay: () => void;
  onSettings: () => void;
};

export function TetrisMenu({ bestScore, onPlay, onSettings }: TetrisMenuProps) {
  const { t } = useLanguage();
  const subtitleParagraphs = t("tetris.menu.subtitle").split("\n\n");

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 py-4 text-center min-[900px]:min-h-[480px] min-[900px]:gap-6 min-[900px]:py-6">
      <p className="max-w-xl text-base font-semibold leading-6 text-ink min-[900px]:hidden">{t("tetris.menu.tagline")}</p>
      <div className="max-w-xl space-y-3 text-base leading-7 text-muted max-[899px]:hidden">
        {subtitleParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <span className="inline-flex items-center gap-2 rounded-lg bg-tetris-soft px-3 py-1.5 text-sm font-semibold text-tetris-ink">
        {t("tetris.menu.bestScore")}
        <span className="font-display text-base font-extrabold tabular-nums">{bestScore}</span>
      </span>

      <div className="grid w-full max-w-sm gap-3">
        <button
          type="button"
          onClick={onPlay}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-tetris px-6 text-base font-bold text-ink transition hover:brightness-95"
        >
          <Play size={18} aria-hidden="true" />
          {t("tetris.menu.play")}
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-6 text-base font-semibold text-ink transition hover:bg-chip"
        >
          <Settings size={18} aria-hidden="true" />
          {t("tetris.menu.settings")}
        </button>
      </div>
    </div>
  );
}
