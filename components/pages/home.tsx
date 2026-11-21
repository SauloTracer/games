import { HomePageContent } from "@/components/home-page-content";
import { articles } from "@/lib/articles";
import type { Language } from "@/lib/i18n";

export function HomeBody(_props: { language: Language }) {
  return <HomePageContent articles={articles} />;
}
