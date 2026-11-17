"use client";

import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

// Puzzle fixo usado apenas como prévia visual do tabuleiro.
const PREVIEW_PUZZLE = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";

function BoardPreview({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="grid aspect-square grid-cols-9 overflow-hidden rounded-md border-2 border-ink"
    >
      {PREVIEW_PUZZLE.split("").map((digit, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const shaded = (Math.floor(row / 3) + Math.floor(col / 3)) % 2 === 1;
        const right = col === 8 ? "border-r-0" : col % 3 === 2 ? "border-r-2 border-r-ink" : "border-r border-r-[#DCE0EA]";
        const bottom = row === 8 ? "border-b-0" : row % 3 === 2 ? "border-b-2 border-b-ink" : "border-b border-b-[#DCE0EA]";

        return (
          <span
            key={index}
            aria-hidden="true"
            className={`flex items-center justify-center font-display text-[15px] font-extrabold text-ink ${right} ${bottom} ${shaded ? "bg-[#F7F8FB]" : "bg-surface"}`}
          >
            {digit === "0" ? "" : digit}
          </span>
        );
      })}
    </div>
  );
}

export function HomeHero() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-7 px-4 pb-8 pt-6 sm:px-6 md:pb-12 md:pt-12 lg:flex-row lg:items-center lg:gap-12 lg:pt-16">
      <div className="flex flex-1 flex-col gap-4 md:gap-6">
        <span className="self-start rounded-full bg-[#FFE9B8] px-3 py-1.5 text-[13px] font-bold text-sudoku-ink">
          {t("home.badge")}
        </span>
        <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-ink md:text-5xl lg:text-[60px] lg:leading-[1.02]">
          {t("home.title")}
        </h1>
        <p className="max-w-[520px] text-base leading-relaxed text-muted md:text-[19px] md:leading-[1.6]">
          {t("home.description")}
        </p>
        <div className="hidden flex-wrap gap-3 sm:flex">
          <Link
            href="/sudoku"
            className="inline-flex h-[52px] items-center gap-2 rounded-xl bg-sudoku px-6 text-base font-bold text-ink transition hover:brightness-95"
          >
            <Play aria-hidden="true" className="h-[18px] w-[18px] fill-current" />
            {t("home.ctaPrimary")}
          </Link>
          <a
            href="#jogos"
            className="inline-flex h-[52px] items-center rounded-xl border-[1.5px] border-ink px-6 text-base font-bold text-ink transition hover:bg-chip"
          >
            {t("home.ctaSecondary")}
          </a>
        </div>
      </div>

      {/* Celular: cartão compacto do desafio do dia */}
      <Link
        href="/sudoku"
        className="flex items-center gap-4 rounded-[20px] bg-ink p-[18px] text-white sm:max-w-[460px] lg:hidden"
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] bg-sudoku">
          <svg aria-hidden="true" width="40" height="40" viewBox="0 0 90 90" fill="none" stroke="#16233F">
            <rect x="3" y="3" width="84" height="84" rx="4" strokeWidth="5" />
            <path d="M31 3v84M59 3v84M3 31h84M3 59h84" strokeWidth="4" />
          </svg>
        </span>
        <span className="flex flex-grow flex-col gap-0.5">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-sudoku">{t("home.dailyKicker")}</span>
          <span className="font-display text-xl font-extrabold">{t("home.dailyGame")}</span>
        </span>
        <ChevronRight aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={2.4} />
      </Link>

      {/* Desktop/tablet: cartão com prévia do tabuleiro */}
      <div className="hidden w-full max-w-[460px] flex-col gap-[18px] rounded-[20px] border border-line bg-surface p-6 shadow-card lg:flex lg:basis-[460px]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-subtle">{t("home.dailyKicker")}</span>
            <span className="font-display text-[22px] font-extrabold text-ink">{t("home.dailyGame")}</span>
          </div>
          <span aria-hidden="true" className="rounded-lg bg-chip px-2.5 py-1.5 text-sm font-bold tabular-nums text-ink">00:00</span>
        </div>
        <BoardPreview label={t("home.dailyBoardLabel")} />
        <Link
          href="/sudoku"
          className="flex h-12 items-center justify-center rounded-xl bg-ink font-bold text-white transition hover:bg-ink-soft"
        >
          {t("home.dailyStart")}
        </Link>
      </div>
    </section>
  );
}
