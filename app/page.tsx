"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur md:p-10">
      <div className="overflow-hidden rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
        <img src="/banner.jpeg" alt={t("home.bannerAlt")} className="hidden h-auto w-full object-cover md:block" />
        <img src="/icon.jpeg" alt={t("home.iconAlt")} className="block h-auto w-full object-cover md:hidden" />
      </div>

      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Puzzled</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/sudoku"
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
        >
          {t("home.play")}
        </Link>
        <Link
          href="/snake"
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          {t("home.playSnake")}
        </Link>
        <Link
          href="/slide"
          className="inline-flex items-center justify-center rounded-full bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700"
        >
          {t("home.playSlide")}
        </Link>
        <Link
          href="/tetris"
          className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700"
        >
          {t("home.playTetris")}
        </Link>
        <Link
          href="/mathwiz"
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          {t("home.playMathWiz")}
        </Link>
        <a
          href="mailto:saulo.tracer@gmail.com"
          className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 font-semibold text-stone-700 transition hover:border-stone-500"
        >
          {t("home.contact")}
        </a>
      </div>
    </section>
  );
}
