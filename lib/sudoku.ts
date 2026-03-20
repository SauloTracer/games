import type { Cell, Difficulty } from "@/lib/types";

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
};

export function parsePuzzle(puzzle: string) {
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => {
      const raw = puzzle[row * 9 + col];
      return raw === "." ? 0 : Number(raw);
    }),
  );
}

export function cloneBoard(board: Cell[][]) {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      candidates: [...cell.candidates],
      storedCandidates: [...cell.storedCandidates],
    })),
  );
}

export function createBoard(puzzle: string, answerGrid: number[][]) {
  const puzzleGrid = parsePuzzle(puzzle);
  return puzzleGrid.map((row, rowIndex) =>
    row.map((value, colIndex) => ({
      row: rowIndex,
      col: colIndex,
      given: value !== 0,
      value: value || null,
      answer: answerGrid[rowIndex][colIndex],
      candidates: [],
      storedCandidates: [],
      markColor: null,
      status: "idle" as const,
    })),
  );
}

export function serializeValues(board: Cell[][]) {
  return board.map((row) => row.map((cell) => cell.value ?? 0));
}

export function isValidPlacement(grid: number[][], row: number, col: number, value: number) {
  for (let index = 0; index < 9; index += 1) {
    if (grid[row][index] === value || grid[index][col] === value) {
      return false;
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (grid[r][c] === value) {
        return false;
      }
    }
  }

  return true;
}

export function solveGrid(grid: number[][]): number[][] | null {
  const copy = grid.map((row) => [...row]);

  function backtrack() {
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        if (copy[row][col] !== 0) {
          continue;
        }

        for (let value = 1; value <= 9; value += 1) {
          if (!isValidPlacement(copy, row, col, value)) {
            continue;
          }

          copy[row][col] = value;
          if (backtrack()) {
            return true;
          }
          copy[row][col] = 0;
        }

        return false;
      }
    }

    return true;
  }

  return backtrack() ? copy : null;
}

export function getCandidates(board: Cell[][], row: number, col: number) {
  if (board[row][col].value) {
    return [];
  }

  const grid = serializeValues(board);
  return Array.from({ length: 9 }, (_, index) => index + 1).filter((value) =>
    isValidPlacement(grid, row, col, value),
  );
}

export function autoFillCandidates(board: Cell[][]) {
  return board.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      if (cell.given || cell.value) {
        return { ...cell, candidates: [], storedCandidates: [...cell.storedCandidates] };
      }

      const candidates = getCandidates(board, rowIndex, colIndex);
      return { ...cell, candidates, storedCandidates: [...candidates] };
    }),
  );
}

export function removeCandidateFromPeers(board: Cell[][], row: number, col: number, value: number) {
  const blockRow = Math.floor(row / 3) * 3;
  const blockCol = Math.floor(col / 3) * 3;

  for (let index = 0; index < 9; index += 1) {
    if (index !== col && !board[row][index].value) {
      board[row][index].candidates = board[row][index].candidates.filter((candidate) => candidate !== value);
      board[row][index].storedCandidates = board[row][index].storedCandidates.filter((candidate) => candidate !== value);
    }

    if (index !== row && !board[index][col].value) {
      board[index][col].candidates = board[index][col].candidates.filter((candidate) => candidate !== value);
      board[index][col].storedCandidates = board[index][col].storedCandidates.filter((candidate) => candidate !== value);
    }
  }

  for (let r = blockRow; r < blockRow + 3; r += 1) {
    for (let c = blockCol; c < blockCol + 3; c += 1) {
      if ((r !== row || c !== col) && !board[r][c].value) {
        board[r][c].candidates = board[r][c].candidates.filter((candidate) => candidate !== value);
        board[r][c].storedCandidates = board[r][c].storedCandidates.filter((candidate) => candidate !== value);
      }
    }
  }

  return board;
}

export function promoteSingles(board: Cell[][]) {
  const next = board.map((row) =>
    row.map((cell) => ({
      ...cell,
      candidates: [...cell.candidates],
      storedCandidates: [...cell.storedCandidates],
    })),
  );

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const cell = next[row][col];
      if (cell.given || cell.value || cell.candidates.length !== 1) {
        continue;
      }

      const value = cell.candidates[0];
      cell.storedCandidates = [...cell.candidates];
      cell.value = value;
      cell.candidates = [];
      cell.status = (value === cell.answer ? "correct" : "wrong") as Cell["status"];
      removeCandidateFromPeers(next, row, col, value);
    }
  }

  return next;
}

export function isSolved(board: Cell[][]) {
  return board.every((row) => row.every((cell) => cell.value === cell.answer));
}

export function countPlaced(board: Cell[][], digit: number) {
  return board.flat().filter((cell) => cell.value === digit).length;
}
