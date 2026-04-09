"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import type { Article } from "@/lib/articles";
import { getArticleCategoryLabel, getArticlePresentation } from "@/lib/article-presentation";

export function ArticlesPageContent({ articles }: { articles: Article[] }) {
  const { messages, t } = useLanguage();
  const categoryOrder: Article["category"][] = ["História dos jogos", "Tutorial de sudoku", "Outros"];
  const categories = categoryOrder.filter((category) => articles.some((article) => article.category === category));

  return (
    <section className="mx-auto max-w-5xl space-y-12 rounded-3xl border border-white/60 bg-white/90 px-6 py-12 shadow-panel md:px-10">
      <div className="space-y-5">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-700">{t("articlesIndex.kicker")}</p>
        <h1 className="text-4xl font-black leading-tight text-stone-950 md:text-5xl">{t("articlesIndex.title")}</h1>
        <p className="max-w-3xl text-lg leading-8 text-stone-700">{t("articlesIndex.description")}</p>
      </div>

      {categories.map((category) => (
        <section key={category} className="space-y-5">
          <h2 className="text-2xl font-black text-stone-950">{getArticleCategoryLabel(messages, category)}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {articles
              .filter((article) => article.category === category)
              .map((article) => {
                const presentation = getArticlePresentation(messages, article);

                return (
                  <Link key={article.slug} href={`/articles/${article.slug}`} className="rounded-lg border border-stone-200 bg-white p-5 transition hover:border-amber-400 hover:shadow-panel">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">{article.readingMinutes} min</p>
                  <h3 className="mt-3 text-xl font-black leading-snug text-stone-950">{presentation.title}</h3>
                  <p className="mt-3 leading-7 text-stone-700">{presentation.description}</p>
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
    </section>
  );
}
