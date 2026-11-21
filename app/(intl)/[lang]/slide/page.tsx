import type { Metadata } from "next";
import { SlideBody } from "@/components/pages/slide";
import { isPrefixedLanguage } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildPageMetadata("slide", lang) : {};
}

export default async function SlidePage({ params }: Props) {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? <SlideBody language={lang} /> : null;
}
