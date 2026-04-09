import type { Metadata } from "next";
import { PrivacyPageContent } from "@/components/privacy-page-content";

export const metadata: Metadata = {
  title: "Privacidade | Puzzled",
  description:
    "Entenda como o Puzzled usa armazenamento local do navegador para idioma, progresso, configurações e recordes dos jogos.",
  alternates: {
    canonical: "https://puzzled.com.br/privacy",
  },
  openGraph: {
    title: "Privacidade | Puzzled",
    description: "Informações sobre armazenamento local, dados de jogo e controles de privacidade no Puzzled.",
    url: "https://puzzled.com.br/privacy",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
