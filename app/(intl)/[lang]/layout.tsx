import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { RootShell } from "@/components/root-shell";
import { isPrefixedLanguage, prefixedLocales } from "@/lib/i18n";
import { buildBaseMetadata } from "@/lib/page-meta";

// Layout raiz das páginas em inglês e espanhol (/en/..., /es/...).
type Props = { children: ReactNode; params: Promise<{ lang: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return prefixedLocales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildBaseMetadata(lang) : {};
}

export default async function LocalizedLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isPrefixedLanguage(lang)) {
    notFound();
  }
  return <RootShell language={lang}>{children}</RootShell>;
}
