import { AboutPageContent } from "@/components/about-page-content";
import { JsonLd, SITE_URL } from "@/components/pages/shared";
import { absoluteUrl, htmlLang, type Language } from "@/lib/i18n";
import { getPageText } from "@/lib/page-meta";

export function AboutBody({ language }: { language: Language }) {
  return (
    <>
      <AboutPageContent />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: getPageText("about", language).ogTitle,
          url: absoluteUrl("/about", language),
          description: getPageText("about", language).description,
          inLanguage: htmlLang[language],
          isPartOf: { "@type": "WebSite", name: "Puzzled", url: SITE_URL },
        }}
      />
    </>
  );
}
