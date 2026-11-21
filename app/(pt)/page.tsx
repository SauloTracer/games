import { HomeBody } from "@/components/pages/home";
import { buildPageMetadata } from "@/lib/page-meta";

export const metadata = buildPageMetadata("home", "pt");

export default function HomePage() {
  return <HomeBody language="pt" />;
}
