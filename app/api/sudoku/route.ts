import { NextResponse } from "next/server";
import { getRandomPuzzle } from "@/lib/sudoku-data";
import type { Difficulty } from "@/lib/types";

const validDifficulties = new Set<Difficulty>(["easy", "medium", "hard", "expert"]);

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty");

  if (!difficulty || !validDifficulties.has(difficulty as Difficulty)) {
    return NextResponse.json({ error: "Invalid difficulty." }, { status: 400 });
  }

  return NextResponse.json(getRandomPuzzle(difficulty as Difficulty));
}
