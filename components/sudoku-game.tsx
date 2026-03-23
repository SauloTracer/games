"use client";

import { Mouse, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "@/components/language-provider";
import { runBoardFilter } from "@/lib/sudoku-filter";
import {
  autoFillCandidates,
  cloneBoard,
  countPlaced,
  createBoard,
  getCandidates,
  isSolved,
  parsePuzzle,
  promoteSingles,
  removeCandidateFromPeers,
  solveGrid,
} from "@/lib/sudoku";
import type { Cell, Difficulty, GameMode } from "@/lib/types";

const difficulties: Difficulty[] = ["easy", "medium", "hard", "expert"];
const markPalette = ["#FEF3C7", "#FECACA", "#BFDBFE", "#BBF7D0", "#E9D5FF", "#F5F5F4"];
const filterPalette = ["#bfdbfe", "#fbcfe8", "#bbf7d0", "#fde68a", "#ddd6fe", "#fecaca"];

type Coord = {
  row: number;
  col: number;
};

type RemotePuzzle = {
  puzzle: string;
  rating: number;
};

type SavedGame = {
  board: Cell[][];
  initialPuzzle: string;
  difficulty: Difficulty;
  gameMode: GameMode;
  candidateMode: boolean;
  autoCheck: boolean;
  errors: number;
  selectedCells: Coord[];
};

type DragSelectionState = {
  active: boolean;
  moved: boolean;
  additive: boolean;
  suppressClick: boolean;
  baseSelection: Coord[];
  visited: Coord[];
};

function coordKey(row: number, col: number) {
  return `${row}-${col}`;
}

function clearTransientState(board: Cell[][]) {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      status: cell.status ?? "idle",
      markColor: cell.markColor ?? null,
      storedCandidates: cell.storedCandidates ?? [],
    })),
  );
}

function ControlKey({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <span
      className={`inline-flex h-9 items-center justify-center rounded-xl border border-stone-300 bg-white px-3 text-xs font-bold text-stone-700 shadow-sm ${wide ? "min-w-[4.5rem]" : "min-w-9"
        }`}
    >
      {children}
    </span>
  );
}

function ControlRow({ visual, text }: { visual: ReactNode; text: string }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-amber-200/80 bg-white/70 p-3 md:grid-cols-[auto_1fr] md:items-center">
      <div className="flex flex-wrap items-center gap-2">{visual}</div>
      <p className="max-w-[36rem] whitespace-normal break-words text-sm leading-6">{text}</p>
    </div>
  );
}

export function SudokuGame() {
  const { t } = useLanguage();
  const [board, setBoard] = useState<Cell[][]>([]);
  const [initialPuzzle, setInitialPuzzle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameMode, setGameMode] = useState<GameMode>("zen");
  const [candidateMode, setCandidateMode] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);
  const [errors, setErrors] = useState(0);
  const [selectedCells, setSelectedCells] = useState<Coord[]>([]);
  const [history, setHistory] = useState<Cell[][][]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty>("easy");
  const [pendingMode, setPendingMode] = useState<GameMode>("zen");
  const [showMarkPanel, setShowMarkPanel] = useState(false);
  const [showFilterHelp, setShowFilterHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [multiselectMode, setMultiselectMode] = useState(false);
  const [showAutoCandidateDialog, setShowAutoCandidateDialog] = useState(false);
  const [hoveredDigit, setHoveredDigit] = useState<number | null>(null);
  const boardRef = useRef<Cell[][]>([]);
  const dragSelectionRef = useRef<DragSelectionState>({
    active: false,
    moved: false,
    additive: false,
    suppressClick: false,
    baseSelection: [],
    visited: [],
  });

  const selectedSet = useMemo(
    () => new Set(selectedCells.map((coord) => coordKey(coord.row, coord.col))),
    [selectedCells],
  );

  const selectedBoardCells = useMemo(
    () => selectedCells.map(({ row, col }) => board[row]?.[col]).filter(Boolean),
    [board, selectedCells],
  );

  const selectionAnchor = selectedCells[selectedCells.length - 1] ?? null;
  const selectedValue =
    selectedCells.length === 1 ? board[selectedCells[0].row]?.[selectedCells[0].col]?.value ?? null : null;
  const isGameOver = gameMode === "three-strikes" && errors >= 3;

  const filterState = useMemo(() => runBoardFilter(board, searchQuery), [board, searchQuery]);
  const difficultyLabel = useMemo(
    () => ({
      easy: t("sudoku.difficulty.easy"),
      medium: t("sudoku.difficulty.medium"),
      hard: t("sudoku.difficulty.hard"),
      expert: t("sudoku.difficulty.expert"),
    }),
    [t],
  );
  const selectedCellsLabel = t("sudoku.selectedCells").replace("{count}", String(selectedCells.length));
  const livesLabel = t("sudoku.lives").replace("{count}", String(Math.max(0, 3 - errors)));

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const pushHistory = useCallback((current: Cell[][]) => {
    setHistory((previous) => [...previous.slice(-59), cloneBoard(current)]);
  }, []);

  const startNewGame = useCallback(async (nextDifficulty: Difficulty, nextMode: GameMode) => {
    setLoading(true);
    setStatus("");

    const response = await fetch(`/api/sudoku?difficulty=${nextDifficulty}`, { cache: "no-store" });
    if (!response.ok) {
      setStatus(t("sudoku.status.loadFailed"));
      setLoading(false);
      return;
    }

    const data = (await response.json()) as RemotePuzzle;
    const solved = solveGrid(parsePuzzle(data.puzzle));
    if (!solved) {
      setStatus(t("sudoku.status.unsolved"));
      setLoading(false);
      return;
    }

    const nextBoard = createBoard(data.puzzle, solved);
    boardRef.current = nextBoard;
    setInitialPuzzle(data.puzzle);
    setBoard(nextBoard);
    setDifficulty(nextDifficulty);
    setGameMode(nextMode);
    setCandidateMode(false);
    setAutoCheck(nextMode === "three-strikes");
    setErrors(0);
    setSelectedCells([]);
    setHistory([]);
    setShowSuccessModal(false);
    setShowNewGameModal(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("sudoku-save");
    if (!raw) {
      setLoading(false);
      setShowNewGameModal(true);
      return;
    }

    try {
      const saved = JSON.parse(raw) as SavedGame;
      const restoredBoard = clearTransientState(saved.board);
      boardRef.current = restoredBoard;
      setBoard(restoredBoard);
      setInitialPuzzle(saved.initialPuzzle);
      setDifficulty(saved.difficulty);
      setGameMode(saved.gameMode);
      setCandidateMode(saved.candidateMode);
      setAutoCheck(saved.autoCheck);
      setErrors(saved.errors);
      setSelectedCells(saved.selectedCells ?? []);
      setPendingDifficulty(saved.difficulty);
      setPendingMode(saved.gameMode);
    } catch {
      setShowNewGameModal(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!board.length || !initialPuzzle) {
      return;
    }

    const payload: SavedGame = {
      board,
      initialPuzzle,
      difficulty,
      gameMode,
      candidateMode,
      autoCheck,
      errors,
      selectedCells,
    };
    localStorage.setItem("sudoku-save", JSON.stringify(payload));
  }, [autoCheck, board, candidateMode, difficulty, errors, gameMode, initialPuzzle, selectedCells]);

  const applyBoard = useCallback(
    (updater: (current: Cell[][]) => Cell[][]) => {
      const current = boardRef.current;
      pushHistory(current);
      const next = updater(cloneBoard(current));
      boardRef.current = next;
      setBoard(next);
      if (!isSolved(current) && isSolved(next)) {
        setShowSuccessModal(true);
        setStatus(t("sudoku.status.solved"));
      } else if (isGameOver) {
        setStatus(t("sudoku.status.gameOver"));
      } else {
        setStatus("");
      }
    },
    [isGameOver, pushHistory, t],
  );

  const setSelection = useCallback((coords: Coord[], replace = true) => {
    setSelectedCells((current) => {
      if (replace) {
        return coords;
      }

      const next = [...current];
      for (const coord of coords) {
        const cellKey = coordKey(coord.row, coord.col);
        const exists = next.some((item) => coordKey(item.row, item.col) === cellKey);
        if (!exists) {
          next.push(coord);
        }
      }
      return next;
    });
  }, []);

  const mergeSelection = useCallback((base: Coord[], extra: Coord[]) => {
    const next = [...base];
    for (const coord of extra) {
      const cellKey = coordKey(coord.row, coord.col);
      const exists = next.some((item) => coordKey(item.row, item.col) === cellKey);
      if (!exists) {
        next.push(coord);
      }
    }
    return next;
  }, []);

  const applyDragSelection = useCallback(
    (coord: Coord) => {
      const drag = dragSelectionRef.current;
      if (!drag.active) {
        return;
      }

      const alreadyVisited = drag.visited.some((item) => item.row === coord.row && item.col === coord.col);
      if (!alreadyVisited) {
        drag.visited = [...drag.visited, coord];
      }

      setSelectedCells(drag.additive ? mergeSelection(drag.baseSelection, drag.visited) : [...drag.visited]);
    },
    [mergeSelection],
  );

  const handleCellMouseDown = useCallback(
    (row: number, col: number, event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.button !== 0) {
        return;
      }

      const additive = multiselectMode || event.ctrlKey || event.metaKey || event.shiftKey;
      const start = { row, col };

      dragSelectionRef.current = {
        active: true,
        moved: false,
        additive,
        suppressClick: true,
        baseSelection: additive ? [...selectedCells] : [],
        visited: [start],
      };

      if (!additive) {
        setSelectedCells([start]);
        return;
      }

      setSelectedCells((current) => mergeSelection(current, [start]));
    },
    [mergeSelection, multiselectMode, selectedCells],
  );

  const handleCellMouseEnter = useCallback(
    (row: number, col: number, event: React.MouseEvent<HTMLButtonElement>) => {
      if ((event.buttons & 1) !== 1 || !dragSelectionRef.current.active) {
        return;
      }

      dragSelectionRef.current.moved = true;
      applyDragSelection({ row, col });
    },
    [applyDragSelection],
  );

  const handleCellClick = useCallback(
    (row: number, col: number, event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.detail > 0 && dragSelectionRef.current.suppressClick) {
        dragSelectionRef.current.suppressClick = false;
        dragSelectionRef.current.moved = false;
        return;
      }

      const cellKey = coordKey(row, col);
      const additive = multiselectMode || event.ctrlKey || event.metaKey || event.shiftKey;

      if (!additive) {
        setSelectedCells([{ row, col }]);
        return;
      }

      setSelectedCells((current) => {
        const exists = current.some((item) => coordKey(item.row, item.col) === cellKey);
        return exists
          ? current.filter((item) => coordKey(item.row, item.col) !== cellKey)
          : [...current, { row, col }];
      });
    },
    [multiselectMode],
  );

  const setCellValue = useCallback(
    (digit: number) => {
      if (selectedBoardCells.length === 0 || isGameOver) {
        return;
      }

      let consumedStrike = false;

      applyBoard((current) => {
        for (const selectedCell of selectedBoardCells) {
          const cell = current[selectedCell.row][selectedCell.col];
          if (cell.given) {
            continue;
          }

          if (candidateMode) {
            cell.candidates = cell.candidates.includes(digit)
              ? cell.candidates.filter((value) => value !== digit)
              : [...cell.candidates, digit].sort((left, right) => left - right);
            cell.storedCandidates = [...cell.candidates];
            cell.value = null;
            cell.status = "idle";
            continue;
          }

          cell.storedCandidates = [...cell.candidates];
          cell.value = digit;
          cell.candidates = [];

          if (autoCheck || gameMode === "three-strikes") {
            const correct = digit === cell.answer;
            cell.status = correct ? "correct" : "wrong";

            if (correct) {
              removeCandidateFromPeers(current, cell.row, cell.col, digit);
            } else if (gameMode === "three-strikes" && !consumedStrike) {
              consumedStrike = true;
            }
          } else {
            cell.status = "idle";
            removeCandidateFromPeers(current, cell.row, cell.col, digit);
          }
        }

        return current;
      });

      if (consumedStrike) {
        setErrors((value) => value + 1);
      }
    },
    [applyBoard, autoCheck, candidateMode, gameMode, isGameOver, selectedBoardCells],
  );

  const clearCell = useCallback(() => {
    if (selectedBoardCells.length === 0) {
      return;
    }

    applyBoard((current) => {
      for (const selectedCell of selectedBoardCells) {
        const cell = current[selectedCell.row][selectedCell.col];
        if (cell.given) {
          continue;
        }

        cell.value = null;
        cell.candidates = [...cell.storedCandidates];
        cell.status = "idle";
      }
      return current;
    });
  }, [applyBoard, selectedBoardCells]);

  const reset = useCallback(() => {
    const solved = solveGrid(parsePuzzle(initialPuzzle));
    if (!solved) {
      return;
    }

    const nextBoard = createBoard(initialPuzzle, solved);
    boardRef.current = nextBoard;
    setBoard(nextBoard);
    setSelectedCells([]);
    setErrors(0);
    setHistory([]);
    setShowSuccessModal(false);
    setStatus("");
  }, [initialPuzzle]);

  const revealCell = useCallback(() => {
    if (selectedBoardCells.length === 0) {
      return;
    }

    applyBoard((current) => {
      for (const selectedCell of selectedBoardCells) {
        const cell = current[selectedCell.row][selectedCell.col];
        if (cell.given) {
          continue;
        }

        cell.value = cell.answer;
        cell.candidates = [];
        cell.status = "correct";
        removeCandidateFromPeers(current, cell.row, cell.col, cell.answer);
      }
      return current;
    });
  }, [applyBoard, selectedBoardCells]);

  const solve = useCallback(() => {
    applyBoard((current) =>
      current.map((row) =>
        row.map((cell) => ({
          ...cell,
          value: cell.answer,
          candidates: [],
          status: "correct" as const,
        })),
      ),
    );
  }, [applyBoard]);

  const applyAutoCandidates = useCallback(
    (scope: "selected" | "all") => {
      setShowAutoCandidateDialog(false);
      applyBoard((current) => {
        if (scope === "all") {
          return autoFillCandidates(current);
        }

        for (const selectedCell of selectedBoardCells) {
          const cell = current[selectedCell.row][selectedCell.col];
          if (!cell.given && !cell.value) {
            cell.candidates = getCandidates(current, cell.row, cell.col);
            cell.storedCandidates = [...cell.candidates];
          }
        }
        return current;
      });
    },
    [applyBoard, selectedBoardCells],
  );

  const handleAutoCandidateClick = useCallback(() => {
    if (selectedBoardCells.length > 0) {
      setShowAutoCandidateDialog(true);
      return;
    }
    applyAutoCandidates("all");
  }, [applyAutoCandidates, selectedBoardCells.length]);

  const singles = useCallback(() => {
    applyBoard((current) => promoteSingles(current));
  }, [applyBoard]);

  const undo = useCallback(() => {
    setHistory((previous) => {
      const snapshot = previous[previous.length - 1];
      if (!snapshot) {
        return previous;
      }
      boardRef.current = snapshot;
      setBoard(snapshot);
      return previous.slice(0, -1);
    });
  }, []);

  const checkCell = useCallback(() => {
    if (selectedBoardCells.length === 0) {
      return;
    }

    applyBoard((current) => {
      for (const selectedCell of selectedBoardCells) {
        const cell = current[selectedCell.row][selectedCell.col];
        if (cell.given || !cell.value) {
          continue;
        }
        cell.status = cell.value === cell.answer ? "correct" : "wrong";
      }
      return current;
    });
  }, [applyBoard, selectedBoardCells]);

  const applyMarkColor = useCallback(
    (color: string | null) => {
      if (selectedBoardCells.length === 0) {
        setShowMarkPanel(false);
        return;
      }

      applyBoard((current) => {
        for (const selectedCell of selectedBoardCells) {
          current[selectedCell.row][selectedCell.col].markColor = color;
        }
        return current;
      });
      setShowMarkPanel(false);
    },
    [applyBoard, selectedBoardCells],
  );

  const clearAllMarks = useCallback(() => {
    applyBoard((current) =>
      current.map((row) =>
        row.map((cell) => ({
          ...cell,
          markColor: null,
        })),
      ),
    );
    setShowMarkPanel(false);
  }, [applyBoard]);

  const clearSelection = useCallback(() => {
    setSelectedCells([]);
    setShowMarkPanel(false);
    setMultiselectMode(false);
  }, []);

  useEffect(() => {
    const stopDragSelection = () => {
      dragSelectionRef.current.active = false;
      dragSelectionRef.current.baseSelection = [];
      dragSelectionRef.current.visited = [];
    };

    window.addEventListener("mouseup", stopDragSelection);
    return () => window.removeEventListener("mouseup", stopDragSelection);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!board.length) {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName;
        if (
          target.isContentEditable ||
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT"
        ) {
          return;
        }
      }

      if (event.key >= "1" && event.key <= "9") {
        event.preventDefault();
        setCellValue(Number(event.key));
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
        event.preventDefault();
        clearCell();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        clearSelection();
        return;
      }

      if (event.key === " " && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setCandidateMode((value) => !value);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setPendingDifficulty(difficulty);
        setPendingMode(gameMode);
        setShowNewGameModal(true);
        return;
      }

      if (!selectionAnchor) {
        return;
      }

      const moves: Record<string, Coord> = {
        ArrowUp: { row: Math.max(0, selectionAnchor.row - 1), col: selectionAnchor.col },
        ArrowDown: { row: Math.min(8, selectionAnchor.row + 1), col: selectionAnchor.col },
        ArrowLeft: { row: selectionAnchor.row, col: Math.max(0, selectionAnchor.col - 1) },
        ArrowRight: { row: selectionAnchor.row, col: Math.min(8, selectionAnchor.col + 1) },
      };

      if (!moves[event.key]) {
        return;
      }

      event.preventDefault();
      if (event.shiftKey || multiselectMode) {
        setSelection([moves[event.key]], false);
      } else {
        setSelection([moves[event.key]]);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    board.length,
    clearCell,
    clearSelection,
    difficulty,
    gameMode,
    multiselectMode,
    selectionAnchor,
    setCellValue,
    setSelection,
    undo,
  ]);

  useEffect(() => {
    if (gameMode === "three-strikes") {
      setAutoCheck(true);
      if (errors >= 3) {
        setStatus(t("sudoku.status.gameOver"));
      }
    }
  }, [errors, gameMode, t]);

  const boardCounts = useMemo(
    () => Array.from({ length: 9 }, (_, index) => countPlaced(board, index + 1)),
    [board],
  );

  const boardBlocks = useMemo(
    () =>
      Array.from({ length: 9 }, (_, blockIndex) => {
        const blockRow = Math.floor(blockIndex / 3) * 3;
        const blockCol = (blockIndex % 3) * 3;
        const cells: Cell[] = [];
        for (let row = blockRow; row < blockRow + 3; row += 1) {
          for (let col = blockCol; col < blockCol + 3; col += 1) {
            const cell = board[row]?.[col];
            if (cell) {
              cells.push(cell);
            }
          }
        }
        return cells;
      }),
    [board],
  );

  return (
    <section className="mx-auto flex w-full max-w-[calc(18cm+8cm+4rem)] flex-col gap-6 rounded-[2rem] border border-white/60 bg-white/90 p-4 shadow-panel backdrop-blur md:p-6">
      <div className="flex flex-wrap items-center gap-3 lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-stone-900 md:text-5xl">{t("sudoku.title")}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-stone-600">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">{difficultyLabel[difficulty]}</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 capitalize">
              {gameMode === "zen" ? t("sudoku.mode.zen") : t("sudoku.mode.threeStrikes")}
            </span>
            {selectedCells.length > 1 ? (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">{selectedCellsLabel}</span>
            ) : null}
            {gameMode === "three-strikes" ? (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">{livesLabel}</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <button
            type="button"
            onClick={() => setCandidateMode(false)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${!candidateMode ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700"
              }`}
          >
            {t("sudoku.answer")}
          </button>
          <button
            type="button"
            onClick={() => setCandidateMode(true)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${candidateMode ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700"
              }`}
          >
            {t("sudoku.candidates")}
          </button>
        </div>
      </div>

      {!board.length && !loading ? (
        <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-10 text-center text-stone-600">
          {t("sudoku.emptyState")}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[max-content_8cm] xl:items-start xl:justify-center">
        <div className="w-full max-w-[18cm] justify-self-center xl:w-fit xl:max-w-none xl:space-y-4">
          <div className="w-full rounded-[1.75rem] border border-amber-100 bg-[#fffdf8] p-3 shadow-inner md:p-4 xl:w-fit xl:max-w-full xl:overflow-visible">
            <div className="sudoku-board" role="grid" aria-label={t("sudoku.boardAriaLabel")}>
              {boardBlocks.map((blockCells, blockIndex) => (
                <div key={blockIndex} className="sudoku-block">
                  {blockCells.map((cell) => {
                    const isSelected = selectedSet.has(coordKey(cell.row, cell.col));
                    const isSameValue = selectedValue !== null && cell.value === selectedValue;
                    const isHoveredDigitValue = hoveredDigit !== null && cell.value === hoveredDigit;
                    const filterGroupIndex = filterState.matchedCells.get(coordKey(cell.row, cell.col));
                    const filtered = filterGroupIndex !== undefined;
                    const filterCandidates = filterState.candidateHighlights.get(coordKey(cell.row, cell.col)) ?? new Map<number, number>();
                    const filterColor = filterGroupIndex !== undefined ? filterPalette[filterGroupIndex % filterPalette.length] : undefined;
                    const overlayStyle = cell.markColor ? { backgroundColor: cell.markColor, opacity: 0.5 } : undefined;

                    return (
                      <div key={`${cell.row}-${cell.col}`} className="sudoku-cell-frame">
                        <button
                          type="button"
                          onMouseDown={(event) => handleCellMouseDown(cell.row, cell.col, event)}
                          onMouseEnter={(event) => handleCellMouseEnter(cell.row, cell.col, event)}
                          onClick={(event) => handleCellClick(cell.row, cell.col, event)}
                          className="sudoku-cell-outer"
                        >
                          <div className="sudoku-cell-overlay" style={overlayStyle} />
                          {cell.value ? (
                            <div
                              className={[
                                "sudoku-cell",
                                cell.given ? "given" : "filled",
                                isSelected ? "selected" : "",
                                !isSelected && isHoveredDigitValue ? "highlightValueCell" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              style={!isSelected && filtered && !isHoveredDigitValue ? { backgroundColor: filterColor } : undefined}
                            >
                              <span
                              className={[
                                "sudoku-value-content",
                                isSameValue ? "highlightValue" : "",
                                cell.status === "wrong" ? "wrong" : "",
                                cell.status === "correct" && !cell.given ? "correct" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {cell.value}
                            </span>
                            </div>
                          ) : (
                            <div
                              className={["sudoku-cell", isSelected ? "selected" : ""].filter(Boolean).join(" ")}
                              style={!isSelected && filtered ? { backgroundColor: filterColor } : undefined}
                            >
                              <div
                                className={[
                                  "sudoku-candidates-grid",
                                  isSelected ? "selected" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => {
                                  const candidateGroupIndex = filterCandidates.get(digit);
                                  const candidateColor =
                                    candidateGroupIndex !== undefined
                                      ? filterPalette[candidateGroupIndex % filterPalette.length]
                                      : undefined;

                                  return (
                                    <div key={digit} className="candidate-spot">
                                      <span
                                      className={[
                                        "sudoku-candidate-value",
                                        cell.candidates.includes(digit) && isSameValue && digit === selectedValue ? "highlightValue" : "",
                                        cell.candidates.includes(digit) && hoveredDigit === digit ? "hoverMatch" : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                      style={{
                                        fontWeight: "bold",
                                        color: cell.candidates.includes(digit)
                                          ? candidateGroupIndex !== undefined
                                            ? "#111827"
                                              : "#555"
                                            : "transparent",
                                          backgroundColor:
                                            cell.candidates.includes(digit) && candidateGroupIndex !== undefined ? candidateColor : undefined,
                                        }}
                                      >
                                        {digit}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden w-fit max-w-[calc(18cm+2rem)] rounded-[1.5rem] border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900 xl:block">
            <p className="font-semibold">{t("sudoku.controlsTitle")}</p>
            <div className="mt-3 grid gap-3">
              <ControlRow
                visual={
                  <>
                    <div className="grid grid-cols-3 gap-1">
                      <span />
                      <ControlKey>↑</ControlKey>
                      <span />
                      <ControlKey>←</ControlKey>
                      <ControlKey>↓</ControlKey>
                      <ControlKey>→</ControlKey>
                    </div>
                    <ControlKey>
                      <Mouse size={16} />
                    </ControlKey>
                  </>
                }
                text={t("sudoku.controlsBoardNavigation")}
              />
              <ControlRow
                visual={
                  <div className="flex flex-col gap-1">
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({ length: 9 }, (_, index) => (
                        <ControlKey key={index}>{index + 1}</ControlKey>
                      ))}
                    </div>
                    <ControlKey wide>{t("sudoku.erase")}</ControlKey>
                  </div>
                }
                text={t("sudoku.controlsNumberInput")}
              />
              <ControlRow visual={<ControlKey wide>Space</ControlKey>} text={t("sudoku.controlsModeSwitch")} />
              <ControlRow
                visual={
                  <>
                    <ControlKey>1</ControlKey>
                    <span className="px-1 text-stone-500">...</span>
                    <ControlKey>9</ControlKey>
                  </>
                }
                text={t("sudoku.controlsHoverHighlight")}
              />
              <ControlRow
                visual={
                  <span className="inline-flex min-w-[12rem] items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-500 shadow-sm">
                    <Search size={14} />
                    <span className="truncate">{t("sudoku.filterPlaceholder")}</span>
                  </span>
                }
                text={t("sudoku.controlsSearch")}
              />
            </div>
            {status ? <p className="mt-2 font-semibold">{status}</p> : null}
            {loading ? <p className="mt-2 font-semibold">{t("sudoku.loadingPuzzle")}</p> : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <div className="grid grid-cols-5 gap-2 md:hidden">
              {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => setCellValue(digit)}
                  onMouseEnter={() => setHoveredDigit(digit)}
                  onMouseLeave={() => setHoveredDigit(null)}
                  disabled={boardCounts[digit - 1] >= 9 || loading}
                  className="rounded-xl border border-stone-200 bg-white px-1 py-2 text-center font-bold text-stone-800 transition hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="block text-base leading-none">{digit}</span>
                  <span className="mt-1 block text-[10px] leading-none text-stone-500">{boardCounts[digit - 1]}/9</span>
                </button>
              ))}
              <button
                type="button"
                onClick={clearCell}
                className="rounded-xl border border-stone-300 bg-white px-1 py-2 text-center text-xs font-semibold text-stone-700"
              >
                {t("sudoku.erase")}
              </button>
            </div>

            <div className="hidden grid-cols-3 gap-2 md:grid">
              {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => setCellValue(digit)}
                  onMouseEnter={() => setHoveredDigit(digit)}
                  onMouseLeave={() => setHoveredDigit(null)}
                  disabled={boardCounts[digit - 1] >= 9 || loading}
                  className="rounded-2xl border border-stone-200 bg-white px-2 py-3 text-center font-bold text-stone-800 transition hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="block text-lg">{digit}</span>
                  <span className="text-xs text-stone-500">{boardCounts[digit - 1]}/9</span>
                </button>
              ))}
            </div>

            <div className="mt-3 hidden md:block">
              <button type="button" onClick={clearCell} className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-700">
                {t("sudoku.erase")}
              </button>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="auto-check" className="text-sm font-semibold text-stone-700">
                {t("sudoku.autoCheck")}
              </label>
              <input
                id="auto-check"
                type="checkbox"
                checked={autoCheck}
                disabled={gameMode === "three-strikes"}
                onChange={(event) => setAutoCheck(event.target.checked)}
              />
            </div>

            <div className="mt-4 grid gap-2">
              {!autoCheck ? (
                <button type="button" onClick={checkCell} className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white" title={t("sudoku.checkCellTitle")}>
                  {t("sudoku.checkCell")}
                </button>
              ) : null}
              <button type="button" onClick={handleAutoCandidateClick} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700" title={t("sudoku.autoCandidateTitle")}>
                {t("sudoku.autoCandidate")}
              </button>
              <button type="button" onClick={singles} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                {t("sudoku.promoteSingles")}
              </button>
              <button
                type="button"
                onClick={() => setMultiselectMode((value) => !value)}
                className={`rounded-2xl px-4 py-3 font-semibold ${multiselectMode ? "bg-sky-700 text-white" : "bg-white text-stone-700"
                  }`}
              >
                {t("sudoku.multiselect")}
              </button>
              <button type="button" onClick={() => setShowMarkPanel((value) => !value)} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                {t("sudoku.markCells")}
              </button>
              <button type="button" onClick={revealCell} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                {t("sudoku.revealCell")}
              </button>
              <button type="button" onClick={solve} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                {t("sudoku.solve")}
              </button>
              <button type="button" onClick={reset} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                {t("sudoku.reset")}
              </button>
              <button type="button" onClick={undo} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                {t("sudoku.undo")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingDifficulty(difficulty);
                  setPendingMode(gameMode);
                  setShowNewGameModal(true);
                }}
                className="rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-amber-700"
              >
                {t("sudoku.newGame")}
              </button>
            </div>

            {showMarkPanel ? (
              <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-3">
                <p className="text-sm font-semibold text-stone-700">{t("sudoku.chooseColor")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {markPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyMarkColor(color)}
                      style={{ backgroundColor: color }}
                      className="h-9 w-9 rounded-full border border-stone-300"
                    />
                  ))}
                </div>
                <div className="mt-3 grid gap-2">
                  <button type="button" onClick={() => applyMarkColor(null)} className="rounded-2xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700">
                    {t("sudoku.clearSelected")}
                  </button>
                  <button type="button" onClick={clearAllMarks} className="rounded-2xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700">
                    {t("sudoku.clearAllMarks")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("sudoku.filterPlaceholder")}
                  className="w-full rounded-2xl border border-stone-300 bg-white py-3 pl-11 pr-4 text-sm text-stone-700 outline-none ring-0"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilterHelp(true)}
                className="rounded-full bg-stone-900 px-3 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                ?
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-stone-500">
              {t("sudoku.filterHelpers")}
            </p>
          </div>
        </aside>

      </div>

      {isGameOver ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-panel">
            <h2 className="text-center text-2xl font-black text-stone-900">{t("sudoku.gameOver.title")}</h2>
            <p className="mt-4 text-center text-sm leading-6 text-stone-600">
              {t("sudoku.gameOver.description")}
            </p>
            <div className="mt-6 grid gap-2">
              <button type="button" onClick={reset} className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700">
                {t("sudoku.gameOver.reviewBoard")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingDifficulty(difficulty);
                  setPendingMode(gameMode);
                  setShowNewGameModal(true);
                }}
                className="rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white"
              >
                {t("sudoku.gameOver.newGame")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSuccessModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-panel">
            <h2 className="text-center text-2xl font-black text-stone-900">{t("sudoku.success.title")}</h2>
            <p className="mt-4 text-center text-sm leading-6 text-stone-600">
              {t("sudoku.success.description")}
            </p>
            <div className="mt-6 grid gap-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700"
              >
                {t("sudoku.success.reviewBoard")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setPendingDifficulty(difficulty);
                  setPendingMode(gameMode);
                  setShowNewGameModal(true);
                }}
                className="rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white"
              >
                {t("sudoku.success.newGame")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showNewGameModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-panel">
            <h2 className="text-center text-2xl font-black text-stone-900">{t("sudoku.newGameModal.title")}</h2>
            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{t("sudoku.newGameModal.mode")}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPendingMode("zen")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${pendingMode === "zen" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"
                    }`}
                >
                  {t("sudoku.mode.zen")}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingMode("three-strikes")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${pendingMode === "three-strikes" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"
                    }`}
                >
                  {t("sudoku.mode.threeStrikes")}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{t("sudoku.newGameModal.difficulty")}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {difficulties.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPendingDifficulty(item)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold ${pendingDifficulty === item ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700"
                      }`}
                  >
                    {difficultyLabel[item]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-stone-200" />

            <div className="mt-6 flex gap-2">
              {board.length ? (
                <button
                  type="button"
                  onClick={() => setShowNewGameModal(false)}
                  className="w-full rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700"
                >
                  {t("sudoku.newGameModal.cancel")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void startNewGame(pendingDifficulty, pendingMode)}
                className="w-full rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white"
              >
                {t("sudoku.newGameModal.startGame")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAutoCandidateDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-panel">
            <h2 className="text-xl font-black text-stone-900">{t("sudoku.autoCandidatesModal.title")}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {t("sudoku.autoCandidatesModal.description")}
            </p>
            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => applyAutoCandidates("selected")}
                className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white"
              >
                {t("sudoku.autoCandidatesModal.selectedCells")}
              </button>
              <button
                type="button"
                onClick={() => applyAutoCandidates("all")}
                className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700"
              >
                {t("sudoku.autoCandidatesModal.wholeBoard")}
              </button>
              <button
                type="button"
                onClick={() => setShowAutoCandidateDialog(false)}
                className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700"
              >
                {t("sudoku.autoCandidatesModal.cancel")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showFilterHelp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-stone-900">{t("sudoku.filterHelp.title")}</h2>
              <button
                type="button"
                onClick={() => setShowFilterHelp(false)}
                className="rounded-full bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700"
              >
                {t("sudoku.filterHelp.close")}
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm leading-6 text-stone-700">
              <p>{t("sudoku.filterHelp.line1")}</p>
              <p>{t("sudoku.filterHelp.line2")}</p>
              <p>{t("sudoku.filterHelp.line3")}</p>
              <p>{t("sudoku.filterHelp.line4")}</p>
              <p>{t("sudoku.filterHelp.line5")}</p>
              <p>{t("sudoku.filterHelp.line6")}</p>
              <p>{t("sudoku.filterHelp.line7")}</p>
              <p>{t("sudoku.filterHelp.line8")}</p>
              <p>{t("sudoku.filterHelp.line9")}</p>
              <p>{t("sudoku.filterHelp.line10")}</p>
              <p>{t("sudoku.filterHelp.line11")}</p>
              <p>{t("sudoku.filterHelp.line12")}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
