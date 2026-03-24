export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type TetrisScreen = "menu" | "settings" | "playing" | "paused" | "game-over";

export type ThemeMode = "arcade-dark" | "arcade-light";

export type BoardCell = TetrominoType | null;

export type PieceMatrix = number[][];

export type ActivePiece = {
  type: TetrominoType;
  rotation: number;
  matrix: PieceMatrix;
  x: number;
  y: number;
};

export type PlayerBoardState = {
  id: string;
  name: string;
  grid: BoardCell[][];
  activePiece: ActivePiece;
  nextQueue: TetrominoType[];
  holdPiece: TetrominoType | null;
  holdLocked: boolean;
  score: number;
  lines: number;
  level: number;
  combo: number;
  dropIntervalMs: number;
  gravityElapsedMs: number;
  clearingRows: number[];
  clearAnimationMs: number;
  gameOver: boolean;
};

export type GameInstance = {
  id: string;
  board: PlayerBoardState;
  controlMode: "local" | "remote";
};

export type TetrisSettings = {
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  muteMusic: boolean;
  muteEffects: boolean;
  initialSpeed: number;
  initialLevel: number;
  theme: ThemeMode;
  showGhostPiece: boolean;
  holdEnabled: boolean;
  showNextQueue: boolean;
  previewCount: 1 | 2 | 3;
};

export type TetrisRankingEntry = {
  score: number;
  lines: number;
  level: number;
  playedAt: string;
};

export type MultiplayerRoomDraft = {
  roomId: string | null;
  players: Array<{ id: string; name: string; connected: boolean }>;
  garbageQueueEnabled: boolean;
};

export type TetrisTickResult = {
  board: PlayerBoardState;
  linesCleared: number;
  pieceLocked: boolean;
  gameOver: boolean;
};
