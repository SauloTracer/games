"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runBoardFilter } from "@/lib/sudoku-filter";
import {
  autoFillCandidates,
  cloneBoard,
  countPlaced,
  createBoard,
  difficultyLabels,
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

export function SudokuGame() {
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
      setStatus("Falha ao carregar um novo jogo.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as RemotePuzzle;
    const solved = solveGrid(parsePuzzle(data.puzzle));
    if (!solved) {
      setStatus("O puzzle selecionado não pôde ser resolvido.");
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
        setStatus("Puzzle resolvido.");
      } else if (isGameOver) {
        setStatus("Fim de jogo.");
      } else {
        setStatus("");
      }
    },
    [isGameOver, pushHistory],
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

  const handleCellClick = useCallback(
    (row: number, col: number, event: React.MouseEvent<HTMLButtonElement>) => {
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
        setStatus("Fim de jogo.");
      }
    }
  }, [errors, gameMode]);

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-stone-900 md:text-5xl">Sudoku</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-stone-600">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">{difficultyLabels[difficulty]}</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 capitalize">
              {gameMode === "zen" ? "Zen" : "3-Strikes"}
            </span>
            {selectedCells.length > 1 ? (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">{selectedCells.length} cells selected</span>
            ) : null}
            {gameMode === "three-strikes" ? (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">
                Lives {Math.max(0, 3 - errors)}/3
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCandidateMode(false)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              !candidateMode ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700"
            }`}
          >
            Answer
          </button>
          <button
            type="button"
            onClick={() => setCandidateMode(true)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              candidateMode ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700"
            }`}
          >
            Candidates
          </button>
        </div>
      </div>

      {!board.length && !loading ? (
        <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-10 text-center text-stone-600">
          Escolha o modo e a dificuldade para iniciar um novo jogo.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[max-content_8cm] xl:items-start xl:justify-center">
        <div className="w-fit justify-self-center rounded-[1.75rem] border border-amber-100 bg-[#fffdf8] p-3 shadow-inner md:p-4 xl:overflow-visible">
          <div className="sudoku-board" role="grid" aria-label="Sudoku board">
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
                      <button type="button" onClick={(event) => handleCellClick(cell.row, cell.col, event)} className="sudoku-cell-outer">
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
                                isSameValue ? "highlightValue" : "",
                                cell.status === "wrong" ? "wrong" : "",
                                cell.status === "correct" && !cell.given ? "correct" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              style={{ aspectRatio: "1 / 1", margin: "5px", padding: "0 10px" }}
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
                              {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => (
                                <div key={digit} className="candidate-spot">
                                  {(() => {
                                    const candidateGroupIndex = filterCandidates.get(digit);
                                    const candidateColor =
                                      candidateGroupIndex !== undefined
                                        ? filterPalette[candidateGroupIndex % filterPalette.length]
                                        : undefined;

                                    return (
                                  <span
                                    className={[
                                      cell.candidates.includes(digit) && isSameValue && digit === selectedValue ? "highlightValue" : "",
                                      cell.candidates.includes(digit) && hoveredDigit === digit ? "hoverMatch" : "",
                                    ]
                                      .filter(Boolean)
                                      .join(" ")}
                                    style={{
                                      fontWeight: "bold",
                                      padding: "0 5px 0 5px",
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
                                    );
                                  })()}
                                </div>
                              ))}
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

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <div className="grid grid-cols-3 gap-2">
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

            <div className="mt-3">
              <button type="button" onClick={clearCell} className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-700">
                Erase
              </button>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="auto-check" className="text-sm font-semibold text-stone-700">
                Auto check
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
                <button type="button" onClick={checkCell} className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white">
                  Check cell
                </button>
              ) : null}
              <button type="button" onClick={handleAutoCandidateClick} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                Auto candidate
              </button>
              <button type="button" onClick={singles} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                Promote singles
              </button>
              <button
                type="button"
                onClick={() => setMultiselectMode((value) => !value)}
                className={`rounded-2xl px-4 py-3 font-semibold ${
                  multiselectMode ? "bg-sky-700 text-white" : "bg-white text-stone-700"
                }`}
              >
                Multiselect
              </button>
              <button type="button" onClick={() => setShowMarkPanel((value) => !value)} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                Mark cells
              </button>
              <button type="button" onClick={revealCell} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                Reveal cell
              </button>
              <button type="button" onClick={solve} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                Solve
              </button>
              <button type="button" onClick={reset} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                Reset
              </button>
              <button type="button" onClick={undo} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
                Undo
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingDifficulty(difficulty);
                  setPendingMode(gameMode);
                  setShowNewGameModal(true);
                }}
                className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700"
              >
                New Game
              </button>
            </div>

            {showMarkPanel ? (
              <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-3">
                <p className="text-sm font-semibold text-stone-700">Choose color</p>
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
                    Clear selected
                  </button>
                  <button type="button" onClick={clearAllMarks} className="rounded-2xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700">
                    Clear all marks
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="xWing(candidate=7) && lines(2,5)"
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none ring-0"
              />
              <button
                type="button"
                onClick={() => setShowFilterHelp(true)}
                className="rounded-full bg-stone-900 px-3 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                ?
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-stone-500">
              Helpers disponíveis: `contains`, `containsAll`, `only`, `count`, `unique`, `hiddenPairs`, `xWing`, `swordfish`, `lines`, `columns`, `blocks`.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p className="font-semibold">Controls</p>
            <p>Use mouse, Shift/Ctrl click ou o modo multiselect. Digite 1-9 para valores, `Delete` para limpar.</p>
            {status ? <p className="mt-2 font-semibold">{status}</p> : null}
            {loading ? <p className="mt-2 font-semibold">Loading puzzle...</p> : null}
          </div>
        </aside>
      </div>

      {isGameOver ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-panel">
            <h2 className="text-center text-2xl font-black text-stone-900">Game Over</h2>
            <p className="mt-4 text-center text-sm leading-6 text-stone-600">
              Você esgotou as 3 vidas no modo 3-Strikes. Revise o tabuleiro ou comece uma nova partida.
            </p>
            <div className="mt-6 grid gap-2">
              <button type="button" onClick={reset} className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700">
                Review board
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
                New game
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSuccessModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-panel">
            <h2 className="text-center text-2xl font-black text-stone-900">Puzzle Complete</h2>
            <p className="mt-4 text-center text-sm leading-6 text-stone-600">
              O tabuleiro foi concluido com sucesso. Voce pode revisar a solucao ou iniciar um novo jogo.
            </p>
            <div className="mt-6 grid gap-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700"
              >
                Review board
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
                New game
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showNewGameModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-panel">
            <h2 className="text-center text-2xl font-black text-stone-900">New Game</h2>
            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Mode</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPendingMode("zen")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    pendingMode === "zen" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  Zen
                </button>
                <button
                  type="button"
                  onClick={() => setPendingMode("three-strikes")}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    pendingMode === "three-strikes" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  3-Strikes
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Difficulty</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {difficulties.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPendingDifficulty(item)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                      pendingDifficulty === item ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {difficultyLabels[item]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              {board.length ? (
                <button
                  type="button"
                  onClick={() => setShowNewGameModal(false)}
                  className="w-full rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700"
                >
                  Cancel
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void startNewGame(pendingDifficulty, pendingMode)}
                className="w-full rounded-2xl bg-amber-600 px-4 py-3 font-semibold text-white"
              >
                Start game
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAutoCandidateDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-panel">
            <h2 className="text-xl font-black text-stone-900">Auto Candidates</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Aplicar candidatos automáticos apenas na seleção atual ou no tabuleiro inteiro?
            </p>
            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => applyAutoCandidates("selected")}
                className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white"
              >
                Selected cells
              </button>
              <button
                type="button"
                onClick={() => applyAutoCandidates("all")}
                className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700"
              >
                Whole board
              </button>
              <button
                type="button"
                onClick={() => setShowAutoCandidateDialog(false)}
                className="rounded-2xl bg-stone-100 px-4 py-3 font-semibold text-stone-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showFilterHelp ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-stone-900">Manual do Filtro</h2>
              <button
                type="button"
                onClick={() => setShowFilterHelp(false)}
                className="rounded-full bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm leading-6 text-stone-700">
              <p>Use `&&` para combinar comandos e `;` para criar grupos independentes.</p>
              <p>`contains(2,3)` destaca células que possuem qualquer um desses candidatos.</p>
              <p>`contains(candidate=2|3)` faz o mesmo com argumentos nomeados.</p>
              <p>`containsAll(1,5)` exige todos os candidatos passados.</p>
              <p>`only(1,2)` destaca células cujo conjunto é exatamente esse.</p>
              <p>`count(2)` ou `count(size=2)` encontra células com exatamente dois candidatos.</p>
              <p>`unique()` destaca hidden singles dentro do universo filtrado.</p>
              <p>`hiddenPairs()` ou `hp()` destaca pares ocultos; `hiddenPairs(pair=1|2)` filtra um par específico.</p>
              <p>`xWing()` ou `xw()` destaca as células que formam um X-Wing; `xWing(candidate=7)` filtra por candidato.</p>
              <p>`swordfish()` ou `sf()` destaca as células que formam um Swordfish; `swordfish(candidate=3)` filtra por candidato.</p>
              <p>`lines(1,3)`, `columns(4,8)` e `blocks(2,5)` restringem o universo.</p>
              <p>Exemplos: `lines(2) && contains(7)`, `blocks(1,4); unique()`, `columns(2,8) && xWing(candidate=7)`.</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
