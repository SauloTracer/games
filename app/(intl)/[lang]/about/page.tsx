import type { Metadata } from "next";
import { AboutBody } from "@/components/pages/about";
import { isPrefixedLanguage } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildPageMetadata("about", lang) : {};
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? <AboutBody language={lang} /> : null;
}
