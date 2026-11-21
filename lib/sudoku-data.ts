import type { Difficulty } from "@/lib/types";
import easy from "@/lib/sudoku-puzzles/easy.json";
import medium from "@/lib/sudoku-puzzles/medium.json";
import hard from "@/lib/sudoku-puzzles/hard.json";
import expert from "@/lib/sudoku-puzzles/expert.json";

type SudokuEntry = [string, number];

// Amostras por dificuldade geradas por scripts/build-sudoku-sets.mjs a partir de src/assets/sudoku.json.
const puzzlesByDifficulty: Record<Difficulty, SudokuEntry[]> = {
  easy: easy as SudokuEntry[],
  medium: medium as SudokuEntry[],
  hard: hard as SudokuEntry[],
  expert: expert as SudokuEntry[],
};

export function getRandomPuzzle(difficulty: Difficulty) {
  const subset = puzzlesByDifficulty[difficulty];
  const sample = subset[Math.floor(Math.random() * subset.length)];
  return {
    puzzle: sample[0],
    rating: sample[1],
  };
}
