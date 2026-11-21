import type { Metadata } from "next";
import { ArticleBody, articleStaticParams, buildArticleMetadata } from "@/components/pages/article";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articleStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return buildArticleMetadata(slug, "pt");
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleBody slug={slug} language="pt" />;
}
