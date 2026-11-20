import { ArticlesPageContent } from "@/components/articles-page-content";
import { articles } from "@/lib/articles";
import type { Language } from "@/lib/i18n";

export function ArticlesBody(_props: { language: Language }) {
  return <ArticlesPageContent articles={articles} />;
}
