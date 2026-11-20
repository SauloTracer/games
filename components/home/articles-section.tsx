"use client";

import { LocalizedLink as Link } from "@/components/localized-link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { fill } from "@/components/home/format";
import type { Article } from "@/lib/articles";
import { getArticleCategoryLabel, getArticlePresentation } from "@/lib/article-presentation";

export const PINNED_ARTICLE_SLUG = "mude-sua-vida-controlando-seus-habitos";
const OTHER_COUNT = 3;

const CATEGORY_DOT: Record<Article["category"], string> = {
  "História dos jogos": "bg-tetris",
  "Tutorial de sudoku": "bg-sudoku",
  Outros: "bg-snake",
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function ArticlesSection({ articles }: { articles: Article[] }) {
  const { messages, t } = useLanguage();
  const pinned = articles.find((article) => article.slug === PINNED_ARTICLE_SLUG) ?? articles[0];
  const rest = articles.filter((article) => article.slug !== pinned?.slug);
  // Ordem determinística no servidor; sorteio só depois de montar, para não quebrar a hidratação.
  const [others, setOthers] = useState(() => rest.slice(0, OTHER_COUNT));

  useEffect(() => {
    setOthers(shuffle(articles.filter((article) => article.slug !== pinned?.slug)).slice(0, OTHER_COUNT));
  }, [articles, pinned?.slug]);

  if (!pinned) return null;
  const pinnedPresentation = getArticlePresentation(messages, pinned);

  return (
    <section id="artigos" aria-labelledby="artigos-title" className="w-full scroll-mt-24 rounded-[20px] border border-line bg-surface">
      <div className="flex w-full flex-col gap-5 p-5 sm:gap-7 sm:p-8 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-subtle">{t("home.featuredArticlesKicker")}</span>
            <h2 id="artigos-title" className="font-display text-2xl font-extrabold tracking-[-0.01em] text-ink md:text-4xl">
              {t("home.articlesTitle")}
            </h2>
          </div>
          <Link href="/articles" className="inline-flex min-h-[44px] items-center text-[15px] font-bold text-ink hover:text-ink-soft">
            {t("home.allArticles")} <span aria-hidden="true">&nbsp;→</span>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <Link
            href={`/articles/${pinned.slug}`}
            className="group flex min-h-[280px] flex-col justify-end gap-3.5 rounded-[20px] bg-ink p-6 text-white md:row-span-3 md:min-h-[360px] md:p-8"
          >
            <span className="self-start rounded-md bg-sudoku px-2.5 py-1 text-xs font-bold text-ink">
              {fill(t("home.featuredBadge"), { minutes: pinned.readingMinutes })}
            </span>
            <h3 className="font-display text-2xl font-extrabold leading-[1.1] md:text-[32px]">{pinnedPresentation.title}</h3>
            <p className="text-base leading-relaxed text-[#C9D1E3]">{pinnedPresentation.description}</p>
            <span className="font-bold text-white group-hover:underline">
              {t("home.readArticle")} <span aria-hidden="true">→</span>
            </span>
          </Link>

          {others.map((article) => {
            const presentation = getArticlePresentation(messages, article);
            return (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="flex items-start gap-4 rounded-2xl border border-line p-4 transition hover:border-line-strong hover:shadow-card sm:p-5"
              >
                <span aria-hidden="true" className={`mt-[5px] h-3 w-3 shrink-0 rounded ${CATEGORY_DOT[article.category]}`} />
                <span className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-semibold text-subtle">
                    {getArticleCategoryLabel(messages, article.category)} · {fill(t("home.minutes"), { minutes: article.readingMinutes })}
                  </span>
                  <span className="text-base font-bold leading-snug text-ink sm:text-[17px]">{presentation.title}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
