import { articles } from "@/lib/articles";

export default function sitemap() {
    const baseUrl = "https://puzzled.com.br";

    const pages = [
        "",
        "/sudoku",
        "/snake",
        "/slide",
        "/tetris",
        "/articles",
        "/about",
        "/contact",
        "/privacy"
    ];

    const staticPages = pages.map((page) => ({
        url: `${baseUrl}${page}`,
        lastModified: new Date(),
    }));

    const articlePages = articles.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(`${article.updatedAt}T12:00:00Z`),
    }));

    return [...staticPages, ...articlePages];
}
