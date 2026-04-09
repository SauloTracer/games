import { SlideGame } from "@/components/slide/slide-game";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racha Cuca online | Slide Puzzle grátis | Puzzled",
  description:
    "Jogue Racha Cuca online grátis. Deslize peças numeradas, organize o tabuleiro em ordem crescente e tente concluir o Slide Puzzle em menos movimentos.",
  keywords: [
    "Racha Cuca",
    "puzzle",
    "slide",
    "numbers game",
    "organize os números",
    "quebra-cabeça deslizante",
  ],
  alternates: {
    canonical: "https://puzzled.com.br/slide",
  },
  openGraph: {
    title: "Racha Cuca online | Slide Puzzle | Puzzled",
    description: "Um quebra-cabeça deslizante de números para treinar ordem, espaço, planejamento e tempo.",
    url: "https://puzzled.com.br/slide",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
  },
};

export default function SlidePage() {
  return <>
    <SlideGame />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Game",
          name: "Racha Cuca | Slide Puzzle",
          description: metadata.description,
          applicationCategory: "Game",
          operatingSystem: "All",
        }),
      }}
    />
  </>;
}
