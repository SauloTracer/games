import type { Metadata } from "next";
import { SudokuBody } from "@/components/pages/sudoku";
import { isPrefixedLanguage } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildPageMetadata("sudoku", lang) : {};
}

export default async function SudokuPage({ params }: Props) {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? <SudokuBody language={lang} /> : null;
}
