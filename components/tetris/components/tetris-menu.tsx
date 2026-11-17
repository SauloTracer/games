"use client";

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
    <div className="flex w-full flex-col items-center justify-center gap-6 py-6 text-center md:min-h-[480px]">
      <div className="max-w-xl space-y-3 text-base leading-7 text-muted">
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
          {t("tetris.menu.play")}
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-6 text-base font-semibold text-ink transition hover:bg-chip"
        >
          {t("tetris.menu.settings")}
        </button>
      </div>
    </div>
  );
}
