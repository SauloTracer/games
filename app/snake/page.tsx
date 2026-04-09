import { SnakeGame } from "@/components/snake/snake-game";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snake online grátis | Jogo da cobrinha | Puzzled",
  description:
    "Jogue Snake online grátis. Controle a cobra, colete comidas especiais, planeje rotas, bata seu recorde local e treine reflexos sem instalar nada.",
  keywords: [
    "play snake",
    "jogo da cobra",
    "jogo da cobrinha",
    "serpente",
    "jogue snake gratis",
    "snake online gratis",
  ],
  alternates: {
    canonical: "https://puzzled.com.br/snake",
  },
  openGraph: {
    title: "Snake online grátis | Puzzled",
    description: "O clássico jogo da cobrinha no navegador, com pontuação, recorde local, boost e controles para desktop e mobile.",
    url: "https://puzzled.com.br/snake",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
  },
};

export default function SnakePage() {
  return <>
    <SnakeGame />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Game",
          name: "Snake",
          description: metadata.description,
          applicationCategory: "Game",
          operatingSystem: "All",
        }),
      }}
    />
  </>;
}
