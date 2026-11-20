import { AboutBody } from "@/components/pages/about";
import { buildPageMetadata } from "@/lib/page-meta";

export const metadata = buildPageMetadata("about", "pt");

export default function AboutPage() {
  return <AboutBody language="pt" />;
}
