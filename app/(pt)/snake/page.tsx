import { SnakeBody } from "@/components/pages/snake";
import { buildPageMetadata } from "@/lib/page-meta";

export const metadata = buildPageMetadata("snake", "pt");

export default function SnakePage() {
  return <SnakeBody language="pt" />;
}
