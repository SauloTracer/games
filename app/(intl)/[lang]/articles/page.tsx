import type { Metadata } from "next";
import { ArticlesBody } from "@/components/pages/articles";
import { isPrefixedLanguage } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildPageMetadata("articles", lang) : {};
}

export default async function ArticlesPage({ params }: Props) {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? <ArticlesBody language={lang} /> : null;
}
