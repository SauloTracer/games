import type { Metadata } from "next";
import { ArticleBody, articleStaticParams, buildArticleMetadata } from "@/components/pages/article";
import { isPrefixedLanguage } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articleStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  return isPrefixedLanguage(lang) ? buildArticleMetadata(slug, lang) : {};
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  return isPrefixedLanguage(lang) ? <ArticleBody slug={slug} language={lang} /> : null;
}
