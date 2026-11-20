import { SudokuBody } from "@/components/pages/sudoku";
import { buildPageMetadata } from "@/lib/page-meta";

export const metadata = buildPageMetadata("sudoku", "pt");

export default function SudokuPage() {
  return <SudokuBody language="pt" />;
}
