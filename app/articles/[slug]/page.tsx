import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePageContent } from "@/components/article-page-content";
import { articles, getArticle } from "@/lib/articles";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const baseUrl = "https://puzzled.com.br";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return {};
  }

  const url = `${baseUrl}/articles/${article.slug}`;

  return {
    title: `${article.title} | Puzzled`,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: "Puzzled",
      locale: "pt_BR",
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const url = `${baseUrl}/articles/${article.slug}`;

  return (
    <>
      <ArticlePageContent article={article} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            url,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            inLanguage: "pt-BR",
            author: {
              "@type": "Organization",
              name: "Puzzled",
            },
            publisher: {
              "@type": "Organization",
              name: "Puzzled",
              url: baseUrl,
            },
          }),
        }}
      />
    </>
  );
}
