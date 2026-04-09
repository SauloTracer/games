import type { Metadata } from "next";
import { articles } from "@/lib/articles";
import { ArticlesPageContent } from "@/components/articles-page-content";

export const metadata: Metadata = {
  title: "Puzzled | Artigos | Histórias de jogos e tutoriais",
  description:
    "Leia artigos do Puzzled sobre a história do Sudoku, Snake, Racha Cuca e Tetris, além de tutoriais de sudoku do básico ao X-Wing, X-Y-Wing e Swordfish.",
  alternates: {
    canonical: "https://puzzled.com.br/articles",
  },
  openGraph: {
    title: "Puzzled | Artigos",
    description: "Histórias de jogos clássicos e guias e estratégias.",
    url: "https://puzzled.com.br/articles",
    siteName: "Puzzled",
    locale: "pt_BR",
    type: "website",
  },
};

export default function ArticlesPage() {
  return <ArticlesPageContent articles={articles} />;
}
