import type { Metadata } from "next";
import { HomeBody } from "@/components/pages/home";
import { isPrefixedLanguage } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildPageMetadata("home", lang) : {};
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? <HomeBody language={lang} /> : null;
}
