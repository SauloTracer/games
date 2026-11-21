import { SlideBody } from "@/components/pages/slide";
import { buildPageMetadata } from "@/lib/page-meta";

export const metadata = buildPageMetadata("slide", "pt");

export default function SlidePage() {
  return <SlideBody language="pt" />;
}
