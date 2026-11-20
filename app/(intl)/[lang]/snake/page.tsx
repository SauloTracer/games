import type { Metadata } from "next";
import { SnakeBody } from "@/components/pages/snake";
import { isPrefixedLanguage } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildPageMetadata("snake", lang) : {};
}

export default async function SnakePage({ params }: Props) {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? <SnakeBody language={lang} /> : null;
}
