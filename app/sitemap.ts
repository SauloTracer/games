export default function sitemap() {
    const baseUrl = "https://puzzled.com.br";

    const pages = [
        "",
        "/sudoku",
        "/snake",
        "/slide",
    ];

    return pages.map((page) => ({
        url: `${baseUrl}${page}`,
        lastModified: new Date(),
    }));
}