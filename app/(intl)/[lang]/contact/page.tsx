import type { Metadata } from "next";
import { ContactBody } from "@/components/pages/contact";
import { isPrefixedLanguage } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? buildPageMetadata("contact", lang) : {};
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  return isPrefixedLanguage(lang) ? <ContactBody language={lang} /> : null;
}
