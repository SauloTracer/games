import { readFileSync } from "node:fs";
import path from "node:path";
import type { Difficulty } from "@/lib/types";

type SudokuEntry = [string, number];

const datasetPath = path.join(process.cwd(), "src/assets/sudoku.json");
const dataset = JSON.parse(readFileSync(datasetPath, "utf8")) as SudokuEntry[];

function rangeForDifficulty(difficulty: Difficulty) {
  switch (difficulty) {
    case "easy":
      return [0, 3];
    case "medium":
      return [3.1, 5];
    case "hard":
      return [5.1, 7];
    case "expert":
      return [7.1, Number.POSITIVE_INFINITY];
  }
}

export function getRandomPuzzle(difficulty: Difficulty) {
  const [min, max] = rangeForDifficulty(difficulty);
  const subset = dataset.filter((entry) => entry[1] >= min && entry[1] <= max);
  const sample = subset[Math.floor(Math.random() * subset.length)];
  return {
    puzzle: sample[0],
    rating: sample[1],
  };
}
