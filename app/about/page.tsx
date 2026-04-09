import type { Metadata } from "next";
import { AboutPageContent } from "@/components/about-page-content";

export const metadata: Metadata = {
  title: "Sobre o Puzzled | Jogos online, lógica e estratégia",
  description:
    "Conheça o Puzzled: um site com Sudoku, Snake, Racha Cuca, Tetris, artigos sobre jogos clássicos e tutoriais de sudoku para iniciantes e jogadores avançados.",
  keywords: [
    "sobre o Puzzled",
    "jogos de lógica",
    "jogos clássicos",
    "sudoku",
    "snake",
    "racha cuca",
    "tutoriais de sudoku",
    "estratégia",
  ],
  alternates: {
    canonical: "https://puzzled.com.br/about",
  },
  openGraph: {
    title: "Sobre o Puzzled",
    description: "Jogos online e artigos para quem gosta de resolver problemas, reconhecer padrões e aprender estratégias.",
    url: "https://puzzled.com.br/about",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutPageContent />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Sobre o Puzzled",
            url: "https://puzzled.com.br/about",
            description: metadata.description,
            isPartOf: {
              "@type": "WebSite",
              name: "Puzzled",
              url: "https://puzzled.com.br",
            },
          }),
        }}
      />
    </>
  );
}
