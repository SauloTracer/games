import type { Metadata } from "next";
import { TetrisBody } from "@/components/pages/tetris";
import { isPrefixedLanguage } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildPageMetadata("tetris", lang) : {};
}

export default async function TetrisPage({ params }: Props) {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? <TetrisBody language={lang} /> : null;
}
