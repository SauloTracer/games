"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Article } from "@/lib/articles";
import { getArticlePresentation } from "@/lib/article-presentation";

const PINNED_ARTICLE_SLUG = "mude-sua-vida-controlando-seus-habitos";

function pickRandomArticles(articles: Article[], count: number) {
  return [...articles].sort(() => Math.random() - 0.5).slice(0, count);
}

function getFeaturedArticles(articles: Article[], count: number) {
  const pinnedArticle = articles.find((article) => article.slug === PINNED_ARTICLE_SLUG);
  const remainingArticles = articles.filter((article) => article.slug !== PINNED_ARTICLE_SLUG);
  const randomArticles = pickRandomArticles(remainingArticles, Math.max(count - 1, 0));

  return pinnedArticle ? [pinnedArticle, ...randomArticles] : randomArticles;
}

export function HomePageContent({ articles }: { articles: Article[] }) {
  const { messages, t } = useLanguage();
  const [featuredArticles, setFeaturedArticles] = useState(() => getFeaturedArticles(articles, 4));

  useEffect(() => {
    setFeaturedArticles(getFeaturedArticles(articles, 4));
  }, [articles]);

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur md:p-10">
      <div className="space-y-8">
        <div className="overflow-hidden rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
          <img src="/banner.jpeg" alt={t("home.bannerAlt")} className="hidden h-auto w-full object-cover md:block" />
          <img src="/icon.jpeg" alt={t("home.iconAlt")} className="block h-auto w-full object-cover md:hidden" />
        </div>

        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-700">Puzzled</p>
          <h1 className="text-3xl font-black text-stone-950 md:text-5xl">{t("home.title")}</h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-stone-700">{t("home.description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 items-center justify-around gap-4 md:grid-cols-3">
        <Link
          href="/sudoku"
          className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
        >
          {t("home.play")}
        </Link>
        <Link
          href="/snake"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          {t("home.playSnake")}
        </Link>
        <Link
          href="/slide"
          className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-6 py-3 font-semibold text-white transition hover:bg-rose-700"
        >
          {t("home.playSlide")}
        </Link>
        <Link
          href="/tetris"
          className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700"
        >
          {t("home.playTetris")}
        </Link>
        <Link
          href="/articles"
          className="inline-flex items-center justify-center rounded-lg bg-[#704214] px-6 py-3 font-semibold text-white transition hover:bg-[#5d3711]"
        >
          {t("home.articles")}
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-700 transition hover:border-stone-500"
        >
          {t("home.contact")}
        </Link>
      </div>

      <section className="space-y-5 border-t border-stone-200 pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-700">{t("home.featuredArticlesKicker")}</p>
            <h2 className="text-2xl font-black text-stone-950">{t("home.featuredArticlesTitle")}</h2>
          </div>
          <Link href="/articles" className="font-semibold text-amber-700 hover:text-amber-900">
            {t("home.allArticles")}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {featuredArticles.map((article) => {
            const presentation = getArticlePresentation(messages, article);

            return (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="rounded-lg border border-stone-200 bg-white p-5 transition hover:border-amber-400 hover:shadow-panel">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">{article.readingMinutes} min</p>
                <h3 className="mt-3 text-lg font-black leading-snug text-stone-950">{presentation.title}</h3>
                <p className="mt-3 line-clamp-3 leading-7 text-stone-700">{presentation.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </section>
  );
}
