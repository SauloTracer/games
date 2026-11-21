import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePageContent } from "@/components/article-page-content";
import { JsonLd } from "@/components/pages/shared";
import { articles, getArticle } from "@/lib/articles";
import { absoluteUrl, htmlLang, ogLocale, SITE_URL, type Language } from "@/lib/i18n";
import { languageAlternates } from "@/lib/page-meta";
import { getArticlePresentation } from "@/lib/article-presentation";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import pt from "@/locales/pt.json";

const dictionaries = { pt, en, es };

export function articleStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

/**
 * Os artigos (fora o de hábitos) só existem em português. Nas URLs em inglês/espanhol a
 * interface vem traduzida, mas o canonical aponta para a versão em português para não
 * competir com ela; o artigo traduzido ganha hreflang normalmente.
 */
export function buildArticleMetadata(slug: string, language: Language): Metadata {
  const article = getArticle(slug);
  if (!article) {
    return {};
  }
  const path = `/articles/${article.slug}`;
  const translated = Boolean(article.localizedContentKey);
  const url = absoluteUrl(path, language);
  // Título e descrição no idioma da página quando o artigo tem tradução.
  const { title, description } = getArticlePresentation(dictionaries[language], article);
  return {
    title: `${title} | Puzzled`,
    description,
    keywords: article.keywords,
    alternates: {
      canonical: translated ? url : absoluteUrl(path, "pt"),
      languages: translated ? languageAlternates(path) : undefined,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Puzzled",
      locale: ogLocale[translated ? language : "pt"],
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export function ArticleBody({ slug, language }: { slug: string; language: Language }) {
  const article = getArticle(slug);
  if (!article) {
    notFound();
  }
  const translated = Boolean(article.localizedContentKey);
  const { title, description } = getArticlePresentation(dictionaries[language], article);
  return (
    <>
      <ArticlePageContent article={article} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          url: absoluteUrl(`/articles/${article.slug}`, translated ? language : "pt"),
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          inLanguage: htmlLang[translated ? language : "pt"],
          author: { "@type": "Organization", name: "Puzzled" },
          publisher: { "@type": "Organization", name: "Puzzled", url: SITE_URL },
        }}
      />
    </>
  );
}
