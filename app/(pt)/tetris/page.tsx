import { TetrisBody } from "@/components/pages/tetris";
import { buildPageMetadata } from "@/lib/page-meta";

export const metadata = buildPageMetadata("tetris", "pt");

export default function TetrisPage() {
  return <TetrisBody language="pt" />;
}
