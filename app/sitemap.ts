import type { MetadataRoute } from "next";
import { articles } from "@/lib/articles";
import { absoluteUrl, locales } from "@/lib/i18n";
import { languageAlternates, pagePaths } from "@/lib/page-meta";

export default function sitemap(): MetadataRoute.Sitemap {
  // Páginas fixas: uma entrada por idioma, cada uma listando as versões nos outros idiomas.
  const staticPages = Object.values(pagePaths).flatMap((path) =>
    locales.map((language) => ({
      url: absoluteUrl(path, language),
      lastModified: new Date(),
      alternates: { languages: languageAlternates(path) },
    })),
  );

  // Artigos: só os traduzidos ganham URLs nos outros idiomas (os demais existem só em português).
  const articlePages = articles.flatMap((article) => {
    const path = `/articles/${article.slug}`;
    const lastModified = new Date(`${article.updatedAt}T12:00:00Z`);
    if (!article.localizedContentKey) {
      return [{ url: absoluteUrl(path, "pt"), lastModified }];
    }
    return locales.map((language) => ({
      url: absoluteUrl(path, language),
      lastModified,
      alternates: { languages: languageAlternates(path) },
    }));
  });

  return [...staticPages, ...articlePages];
}
