"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { useLanguage } from "@/components/language-provider";
import { SlideThumb, SnakeThumb, SudokuThumb, TetrisThumb } from "@/components/home/game-thumbs";

type Category = "logic" | "reflex";
type Filter = "all" | Category;

type Game = {
  id: string;
  href: string;
  nameKey: string;
  descriptionKey: string;
  category: Category;
  Thumb: ComponentType;
  thumbClass: string;
  tagClass: string;
};

const GAMES: Game[] = [
  { id: "sudoku", href: "/sudoku", nameKey: "home.play", descriptionKey: "home.sudokuDescription", category: "logic", Thumb: SudokuThumb, thumbClass: "bg-sudoku", tagClass: "sm:bg-sudoku-soft sm:text-sudoku-ink" },
  { id: "snake", href: "/snake", nameKey: "home.playSnake", descriptionKey: "home.snakeDescription", category: "reflex", Thumb: SnakeThumb, thumbClass: "bg-snake", tagClass: "sm:bg-snake-soft sm:text-snake-ink" },
  { id: "slide", href: "/slide", nameKey: "home.playSlide", descriptionKey: "home.slideDescription", category: "logic", Thumb: SlideThumb, thumbClass: "bg-slide", tagClass: "sm:bg-slide-soft sm:text-slide-ink" },
  { id: "tetris", href: "/tetris", nameKey: "home.playTetris", descriptionKey: "home.tetrisDescription", category: "reflex", Thumb: TetrisThumb, thumbClass: "bg-tetris", tagClass: "sm:bg-tetris-soft sm:text-tetris-ink" },
];

const FILTERS: Array<{ value: Filter; labelKey: string }> = [
  { value: "all", labelKey: "home.filterAll" },
  { value: "logic", labelKey: "home.filterLogic" },
  { value: "reflex", labelKey: "home.filterReflex" },
];

const CATEGORY_LABEL: Record<Category, string> = { logic: "home.filterLogic", reflex: "home.filterReflex" };

export function GamesSection() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");
  const visible = GAMES.filter((game) => filter === "all" || game.category === filter);

  return (
    <section
      id="jogos"
      aria-labelledby="jogos-title"
      className="mx-auto flex w-full max-w-[1200px] scroll-mt-24 flex-col gap-4 px-4 pb-12 sm:gap-6 sm:px-6 md:pb-[72px]"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="jogos-title" className="font-display text-2xl font-extrabold tracking-[-0.01em] text-ink md:text-4xl">
          {t("home.gamesTitle")}
        </h2>
        <div role="group" aria-label={t("home.filterLabel")} className="flex flex-wrap gap-2">
          {FILTERS.map((option) => {
            const active = option.value === filter;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.value)}
                className={`h-11 rounded-full px-4 text-sm font-semibold transition ${
                  active ? "bg-ink text-white" : "border border-line-strong bg-surface text-ink hover:border-ink"
                }`}
              >
                {t(option.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {visible.map(({ id, href, nameKey, descriptionKey, category, Thumb, thumbClass, tagClass }) => (
          <li key={id} className="flex">
            <Link
              href={href}
              className="group flex w-full flex-col overflow-hidden rounded-[18px] border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-card sm:rounded-[20px]"
            >
              <span className={`flex h-24 items-center justify-center sm:h-[170px] ${thumbClass}`}>
                <Thumb />
              </span>
              <div className="flex flex-1 flex-col gap-0.5 px-3.5 pb-3.5 pt-3 sm:gap-2 sm:px-5 sm:pb-5 sm:pt-[18px]">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <h3 className="font-display text-lg font-extrabold text-ink sm:text-[22px]">{t(nameKey)}</h3>
                  <span className={`self-start rounded-md text-[13px] text-subtle sm:self-auto sm:px-2 sm:py-1 sm:text-xs sm:font-bold ${tagClass}`}>
                    {t(CATEGORY_LABEL[category])}
                  </span>
                </div>
                <span className="hidden text-[15px] leading-normal text-muted sm:block">{t(descriptionKey)}</span>
                <span className="mt-1.5 hidden text-[15px] font-bold text-ink group-hover:text-ink-soft sm:block">
                  {t("home.playCta")} <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
