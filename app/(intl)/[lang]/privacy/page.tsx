import type { Metadata } from "next";
import { PrivacyBody } from "@/components/pages/privacy";
import { isPrefixedLanguage } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildPageMetadata("privacy", lang) : {};
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? <PrivacyBody language={lang} /> : null;
}
