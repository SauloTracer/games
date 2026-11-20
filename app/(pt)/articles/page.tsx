import { ArticlesBody } from "@/components/pages/articles";
import { buildPageMetadata } from "@/lib/page-meta";

export const metadata = buildPageMetadata("articles", "pt");

export default function ArticlesPage() {
  return <ArticlesBody language="pt" />;
}
