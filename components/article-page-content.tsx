"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import type { Article } from "@/lib/articles";
import { getArticlePresentation, getLocalizedHabitArticle } from "@/lib/article-presentation";

function getDateLocale(language: "en" | "pt" | "es") {
  if (language === "pt") {
    return "pt-BR";
  }

  if (language === "es") {
    return "es-ES";
  }

  return "en-US";
}

export function ArticlePageContent({ article }: { article: Article }) {
  const { language, messages, t } = useLanguage();
  const localizedHabitArticle = getLocalizedHabitArticle(messages, article);
  const presentation = getArticlePresentation(messages, article);

  return (
    <article className="mx-auto max-w-4xl rounded-3xl border border-white/60 bg-white/95 px-6 py-12 shadow-panel md:px-12">
      <Link href="/articles" className="font-semibold text-amber-700 hover:text-amber-900">
        {t("articlePage.back")}
      </Link>

      <header className="mt-8 space-y-5 border-b border-stone-200 pb-8">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-700">{presentation.categoryLabel}</p>
        <h1 className="text-4xl font-black leading-tight text-stone-950 md:text-5xl">{presentation.title}</h1>
        <p className="text-lg leading-8 text-stone-700">{presentation.description}</p>
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-stone-600">
          <time dateTime={article.updatedAt}>
            {t("articlePage.updatedOn")} {new Intl.DateTimeFormat(getDateLocale(language)).format(new Date(`${article.updatedAt}T12:00:00Z`))}
          </time>
          <span>
            {article.readingMinutes} {t("articlePage.readingTime")}
          </span>
        </div>
      </header>

      {localizedHabitArticle ? (
        <div className="mt-10 space-y-12">
          <section className="space-y-5">
            {localizedHabitArticle.intro.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-9 text-stone-700">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-black leading-tight text-stone-950 md:text-3xl">{localizedHabitArticle.frameworkTitle}</h2>
              <p className="text-lg leading-9 text-stone-700">{localizedHabitArticle.frameworkIntro}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <section className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-5">
                <h3 className="text-xl font-black text-stone-950">{localizedHabitArticle.triggerTitle}</h3>
                <p className="leading-8 text-stone-700">{localizedHabitArticle.triggerBody}</p>
                <ul className="list-disc space-y-2 pl-5 leading-8 text-stone-700">
                  {localizedHabitArticle.triggerItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
                <h3 className="text-xl font-black text-stone-950">{localizedHabitArticle.actionTitle}</h3>
                <p className="leading-8 text-stone-700">{localizedHabitArticle.actionBody}</p>
                <ul className="list-disc space-y-2 pl-5 leading-8 text-stone-700">
                  {localizedHabitArticle.actionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
                <h3 className="text-xl font-black text-stone-950">{localizedHabitArticle.rewardTitle}</h3>
                <p className="leading-8 text-stone-700">{localizedHabitArticle.rewardBody}</p>
                <ul className="list-disc space-y-2 pl-5 leading-8 text-stone-700">
                  {localizedHabitArticle.rewardItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </section>

          <section className="space-y-5">
            {localizedHabitArticle.closing.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-9 text-stone-700">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-black leading-tight text-stone-950 md:text-3xl">{localizedHabitArticle.booksTitle}</h2>
              <p className="text-lg leading-9 text-stone-700">{localizedHabitArticle.booksIntro}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {localizedHabitArticle.books.map((book) => (
                <article key={book.title} className="space-y-4 rounded-lg border border-stone-200 bg-white p-5">
                  <a href={book.link} target="_blank" rel="noreferrer sponsored" className="block overflow-hidden rounded-lg border border-stone-200">
                    <img src={book.image} alt={book.imageAlt} className="h-64 w-full object-cover" />
                  </a>
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-stone-950">{book.title}</h3>
                    <p className="leading-8 text-stone-700">{book.description}</p>
                    <ul className="list-disc space-y-2 pl-5 leading-8 text-stone-700">
                      {book.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <a href={book.link} target="_blank" rel="noreferrer sponsored" className="inline-flex rounded-lg bg-[#704214] px-5 py-3 font-semibold text-white transition hover:bg-[#5d3711]">
                    {t("articlePage.viewBook")}
                  </a>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {article.sections.map((section) => (
            <section key={section.heading} className="space-y-5">
              <h2 className="text-2xl font-black leading-tight text-stone-950 md:text-3xl">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-9 text-stone-700">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      )}

      <footer className="mt-12 border-t border-stone-200 pt-8">
        <Link href={article.callToAction.href} className="inline-flex rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white">
          {presentation.callToActionLabel}
        </Link>
      </footer>
    </article>
  );
}
