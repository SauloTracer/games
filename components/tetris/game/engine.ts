import { getPieceMatrix } from "@/components/tetris/game/tetrominos";
import type { ActivePiece, BoardCell, PlayerBoardState, TetrisSettings, TetrisTickResult, TetrominoType } from "@/components/tetris/game/types";

export const TETRIS_COLUMNS = 10;
export const TETRIS_ROWS = 20;
const CLEAR_ANIMATION_MS = 120;
const LINE_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export function createEmptyGrid(rows = TETRIS_ROWS, columns = TETRIS_COLUMNS): BoardCell[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => null));
}

function shuffleBag() {
  const bag: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
  }
  return bag;
}

function ensureQueue(queue: TetrominoType[]) {
  const nextQueue = [...queue];
  while (nextQueue.length < 7) {
    nextQueue.push(...shuffleBag());
  }
  return nextQueue;
}

function countTopPadding(matrix: number[][]) {
  let topPadding = 0;
  while (topPadding < matrix.length && matrix[topPadding]?.every((cell) => cell === 0)) {
    topPadding += 1;
  }
  return topPadding;
}

function createSpawnPiece(type: TetrominoType): ActivePiece {
  const matrix = getPieceMatrix(type, 0);
  return {
    type,
    rotation: 0,
    matrix,
    x: Math.floor((TETRIS_COLUMNS - matrix[0].length) / 2),
    y: -countTopPadding(matrix),
  };
}

function nextLevel(settings: TetrisSettings, lines: number) {
  return settings.initialLevel + Math.floor(lines / 10);
}

function nextDropInterval(settings: TetrisSettings, level: number) {
  return Math.max(70, settings.initialSpeed - level * 45);
}

function withDerivedStats(board: PlayerBoardState, settings: TetrisSettings) {
  const level = nextLevel(settings, board.lines);
  return {
    ...board,
    level,
    dropIntervalMs: nextDropInterval(settings, level),
  };
}

export function createPlayerBoard(name: string, settings: TetrisSettings, id = randomId()): PlayerBoardState {
  const preparedQueue = ensureQueue([]);
  const [nextType, ...rest] = preparedQueue;
  return withDerivedStats(
    {
      id,
      name,
      grid: createEmptyGrid(),
      activePiece: createSpawnPiece(nextType),
      nextQueue: ensureQueue(rest),
      holdPiece: null,
      holdLocked: false,
      score: 0,
      lines: 0,
      level: settings.initialLevel,
      combo: -1,
      dropIntervalMs: settings.initialSpeed,
      gravityElapsedMs: 0,
      clearingRows: [],
      clearAnimationMs: 0,
      gameOver: false,
    },
    settings,
  );
}

function cloneGrid(grid: BoardCell[][]) {
  return grid.map((row) => [...row]);
}

export function collides(grid: BoardCell[][], piece: ActivePiece) {
  for (let row = 0; row < piece.matrix.length; row += 1) {
    for (let column = 0; column < piece.matrix[row].length; column += 1) {
      if (!piece.matrix[row][column]) {
        continue;
      }
      const nextX = piece.x + column;
      const nextY = piece.y + row;
      if (nextX < 0 || nextX >= TETRIS_COLUMNS || nextY >= TETRIS_ROWS) {
        return true;
      }
      if (nextY >= 0 && grid[nextY][nextX]) {
        return true;
      }
    }
  }
  return false;
}

function consumeNextPiece(queue: TetrominoType[]) {
  const nextQueue = ensureQueue(queue);
  const [nextType, ...rest] = nextQueue;
  return {
    activePiece: createSpawnPiece(nextType),
    nextQueue: ensureQueue(rest),
  };
}

function mergePiece(grid: BoardCell[][], piece: ActivePiece) {
  const nextGrid = cloneGrid(grid);
  for (let row = 0; row < piece.matrix.length; row += 1) {
    for (let column = 0; column < piece.matrix[row].length; column += 1) {
      if (!piece.matrix[row][column]) {
        continue;
      }
      const y = piece.y + row;
      const x = piece.x + column;
      if (y >= 0 && y < TETRIS_ROWS && x >= 0 && x < TETRIS_COLUMNS) {
        nextGrid[y][x] = piece.type;
      }
    }
  }
  return nextGrid;
}

function listCompletedRows(grid: BoardCell[][]) {
  const rows: number[] = [];
  for (let row = 0; row < grid.length; row += 1) {
    if (grid[row].every(Boolean)) {
      rows.push(row);
    }
  }
  return rows;
}

function finalizeClearedRows(board: PlayerBoardState, settings: TetrisSettings) {
  if (!board.clearingRows.length) {
    return board;
  }
  const cleared = new Set(board.clearingRows);
  const remainingRows = board.grid.filter((_, row) => !cleared.has(row));
  const missingRows = Array.from({ length: board.clearingRows.length }, () => Array.from({ length: TETRIS_COLUMNS }, () => null as BoardCell));
  const grid = [...missingRows, ...remainingRows];
  const clearedCount = board.clearingRows.length;
  const combo = clearedCount > 0 ? board.combo + 1 : -1;
  const comboBonus = combo > 0 ? combo * 50 : 0;
  const nextBoard = withDerivedStats(
    {
      ...board,
      grid,
      lines: board.lines + clearedCount,
      score: board.score + (LINE_SCORES[clearedCount] ?? 0) + comboBonus,
      combo,
      clearingRows: [],
      clearAnimationMs: 0,
      holdLocked: false,
    },
    settings,
  );
  return collides(nextBoard.grid, nextBoard.activePiece) ? { ...nextBoard, gameOver: true } : nextBoard;
}

function lockPiece(board: PlayerBoardState, settings: TetrisSettings): TetrisTickResult {
  const mergedGrid = mergePiece(board.grid, board.activePiece);
  const completedRows = listCompletedRows(mergedGrid);
  const consumed = consumeNextPiece(board.nextQueue);
  const spawnedBoard = withDerivedStats(
    {
      ...board,
      grid: mergedGrid,
      ...consumed,
      gravityElapsedMs: 0,
      combo: completedRows.length ? board.combo : -1,
      clearingRows: completedRows,
      clearAnimationMs: 0,
      holdLocked: completedRows.length ? true : false,
    },
    settings,
  );

  const boardAfterClear = completedRows.length
    ? spawnedBoard
    : {
        ...spawnedBoard,
        holdLocked: false,
      };
  const spawnCollision = completedRows.length ? false : collides(boardAfterClear.grid, boardAfterClear.activePiece);
  const nextBoard = spawnCollision ? { ...boardAfterClear, gameOver: true } : boardAfterClear;

  return {
    board: nextBoard,
    linesCleared: completedRows.length,
    pieceLocked: true,
    gameOver: spawnCollision,
  };
}

function attemptMove(board: PlayerBoardState, deltaX: number, deltaY: number) {
  const nextPiece = { ...board.activePiece, x: board.activePiece.x + deltaX, y: board.activePiece.y + deltaY };
  if (collides(board.grid, nextPiece)) {
    return board;
  }
  return { ...board, activePiece: nextPiece };
}

export function movePiece(board: PlayerBoardState, deltaX: number) {
  if (board.gameOver || board.clearingRows.length) {
    return board;
  }
  return attemptMove(board, deltaX, 0);
}

export function rotatePiece(board: PlayerBoardState) {
  if (board.gameOver || board.clearingRows.length) {
    return board;
  }

  const nextRotation = (board.activePiece.rotation + 1) % 4;
  const rotated: ActivePiece = {
    ...board.activePiece,
    rotation: nextRotation,
    matrix: getPieceMatrix(board.activePiece.type, nextRotation),
  };
  const kicks = [0, -1, 1, -2, 2];
  for (const offsetX of kicks) {
    const candidate = { ...rotated, x: rotated.x + offsetX };
    if (!collides(board.grid, candidate)) {
      return { ...board, activePiece: candidate };
    }
  }
  return board;
}

export function applyHold(board: PlayerBoardState) {
  if (board.gameOver || board.clearingRows.length || board.holdLocked) {
    return board;
  }

  if (!board.holdPiece) {
    const consumed = consumeNextPiece(board.nextQueue);
    const nextBoard = {
      ...board,
      holdPiece: board.activePiece.type,
      ...consumed,
      holdLocked: true,
      gravityElapsedMs: 0,
    };
    return collides(nextBoard.grid, nextBoard.activePiece) ? { ...nextBoard, gameOver: true } : nextBoard;
  }

  const nextBoard = {
    ...board,
    activePiece: createSpawnPiece(board.holdPiece),
    holdPiece: board.activePiece.type,
    holdLocked: true,
    gravityElapsedMs: 0,
  };
  return collides(nextBoard.grid, nextBoard.activePiece) ? { ...nextBoard, gameOver: true } : nextBoard;
}

export function softDrop(board: PlayerBoardState, settings: TetrisSettings): TetrisTickResult {
  if (board.gameOver) {
    return { board, linesCleared: 0, pieceLocked: false, gameOver: true };
  }
  if (board.clearingRows.length) {
    return { board, linesCleared: 0, pieceLocked: false, gameOver: false };
  }

  const moved = attemptMove(board, 0, 1);
  if (moved !== board) {
    return { board: moved, linesCleared: 0, pieceLocked: false, gameOver: false };
  }
  return lockPiece(board, settings);
}

export function hardDrop(board: PlayerBoardState, settings: TetrisSettings): TetrisTickResult {
  if (board.gameOver || board.clearingRows.length) {
    return { board, linesCleared: 0, pieceLocked: false, gameOver: board.gameOver };
  }
  let current = board;
  let steps = 0;
  while (true) {
    const moved = attemptMove(current, 0, 1);
    if (moved === current) {
      const locked = lockPiece(
        {
          ...current,
          score: current.score + steps * 2,
        },
        settings,
      );
      return locked;
    }
    current = moved;
    steps += 1;
  }
}

export function getGhostPiece(board: PlayerBoardState) {
  let ghost = board.activePiece;
  while (!collides(board.grid, { ...ghost, y: ghost.y + 1 })) {
    ghost = { ...ghost, y: ghost.y + 1 };
  }
  return ghost;
}

export function tickBoard(board: PlayerBoardState, settings: TetrisSettings, deltaMs: number): TetrisTickResult {
  if (board.gameOver) {
    return { board, linesCleared: 0, pieceLocked: false, gameOver: true };
  }

  if (board.clearingRows.length) {
    const nextBoard = {
      ...board,
      clearAnimationMs: board.clearAnimationMs + deltaMs,
    };
    if (nextBoard.clearAnimationMs >= CLEAR_ANIMATION_MS) {
      return {
        board: finalizeClearedRows(nextBoard, settings),
        linesCleared: 0,
        pieceLocked: false,
        gameOver: false,
      };
    }
    return { board: nextBoard, linesCleared: 0, pieceLocked: false, gameOver: false };
  }

  let gravityElapsedMs = board.gravityElapsedMs + deltaMs;
  let nextBoard = board;
  let locked = false;
  let linesCleared = 0;

  while (gravityElapsedMs >= nextBoard.dropIntervalMs && !locked) {
    gravityElapsedMs -= nextBoard.dropIntervalMs;
    const tickResult = softDrop(nextBoard, settings);
    nextBoard = tickResult.board;
    locked = tickResult.pieceLocked;
    linesCleared = tickResult.linesCleared;
  }

  return {
    board: { ...nextBoard, gravityElapsedMs },
    linesCleared,
    pieceLocked: locked,
    gameOver: nextBoard.gameOver,
  };
}
