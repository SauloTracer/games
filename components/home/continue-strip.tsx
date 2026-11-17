"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { loadSlideRecords, loadSlideSettings } from "@/components/slide/services/storage";
import { loadBestSnakeScore } from "@/components/snake/services/storage";
import { loadTetrisHighScore } from "@/components/tetris/services/storage";
import { fill } from "@/components/home/format";
import { isSolved } from "@/lib/sudoku";
import type { Cell, Difficulty } from "@/lib/types";

// Chave usada por components/sudoku-game.tsx para a partida em andamento.
const SUDOKU_SAVE_KEY = "sudoku-save";
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

type SavedProgress = {
  sudoku: Difficulty | null;
  snake: number;
  tetris: number;
  slide: { size: string; moves: number } | null;
};

function readSudokuSave(): Difficulty | null {
  try {
    const raw = window.localStorage.getItem(SUDOKU_SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { board?: Cell[][]; difficulty?: Difficulty };
    if (!Array.isArray(saved.board) || saved.board.length !== 9) return null;
    if (isSolved(saved.board)) return null;
    return saved.difficulty && DIFFICULTIES.includes(saved.difficulty) ? saved.difficulty : "medium";
  } catch {
    return null;
  }
}

function readSlideRecord(): SavedProgress["slide"] {
  try {
    const records = loadSlideRecords();
    const { boardSize } = loadSlideSettings();
    const preferred = `${boardSize}x${boardSize}`;
    const keys = [preferred, ...Object.keys(records).filter((key) => key !== preferred)];
    for (const key of keys) {
      const moves = records[key]?.bestMoves;
      if (typeof moves === "number" && moves > 0) {
        return { size: key, moves };
      }
    }
  } catch {
    // ignora storage indisponível
  }
  return null;
}

function readProgress(): SavedProgress {
  const safe = (read: () => number) => {
    try {
      const value = read();
      return value > 0 ? value : 0;
    } catch {
      return 0;
    }
  };

  return {
    sudoku: readSudokuSave(),
    snake: safe(loadBestSnakeScore),
    tetris: safe(loadTetrisHighScore),
    slide: readSlideRecord(),
  };
}

function Dot({ className }: { className: string }) {
  return <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${className}`} />;
}

const itemClass =
  "flex min-h-[44px] items-center gap-2.5 text-[15px] text-muted transition hover:text-ink-soft";

export function ContinueStrip() {
  const { t, language } = useLanguage();
  const [progress, setProgress] = useState<SavedProgress | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  if (!progress) return null;
  const hasAnything = progress.sudoku || progress.snake || progress.tetris || progress.slide;
  if (!hasAnything) return null;

  const number = (value: number) => value.toLocaleString(language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR");

  return (
    <section aria-label={t("home.continueTitle")} className="mx-auto w-full max-w-[1200px] px-4 pb-8 sm:px-6 md:pb-14">
      <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface px-5 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-1">
        <h2 className="py-1 text-[15px] font-bold text-ink">{t("home.continueTitle")}</h2>
        {progress.sudoku ? (
          <Link href="/sudoku" className={`${itemClass} font-semibold text-ink`}>
            <Dot className="bg-sudoku" />
            {fill(t("home.continueSudoku"), { difficulty: t(`sudoku.difficulty.${progress.sudoku}`) })}
          </Link>
        ) : null}
        {progress.snake ? (
          <Link href="/snake" className={itemClass}>
            <Dot className="bg-snake" />
            {fill(t("home.continueSnake"), { score: number(progress.snake) })}
          </Link>
        ) : null}
        {progress.slide ? (
          <Link href="/slide" className={itemClass}>
            <Dot className="bg-slide" />
            {fill(t("home.continueSlide"), { size: progress.slide.size, moves: number(progress.slide.moves) })}
          </Link>
        ) : null}
        {progress.tetris ? (
          <Link href="/tetris" className={itemClass}>
            <Dot className="bg-tetris" />
            {fill(t("home.continueTetris"), { score: number(progress.tetris) })}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
