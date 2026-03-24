import type { PieceMatrix, TetrominoType } from "@/components/tetris/game/types";

export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: "#38bdf8",
  O: "#facc15",
  T: "#c084fc",
  S: "#4ade80",
  Z: "#fb7185",
  J: "#60a5fa",
  L: "#fb923c",
};

export const TETROMINO_MATRICES: Record<TetrominoType, PieceMatrix> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export function rotateMatrix(matrix: PieceMatrix): PieceMatrix {
  const size = matrix.length;
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => matrix[size - 1 - column]?.[row] ?? 0),
  );
}

export function getPieceMatrix(type: TetrominoType, rotation = 0) {
  let matrix = TETROMINO_MATRICES[type].map((row) => [...row]);
  for (let step = 0; step < (rotation % 4 + 4) % 4; step += 1) {
    matrix = rotateMatrix(matrix);
  }
  return matrix;
}

