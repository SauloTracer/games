"use client";

import {
  CheckCheck,
  CircleHelp,
  Delete,
  Grid3x3,
  Highlighter,
  Lightbulb,
  Mouse,
  PencilLine,
  Printer,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  SquareDashedMousePointer,
  Undo2,
  WandSparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionButton,
  ActionGrid,
  BodyPortal,
  GameBody,
  GameFooter,
  GameHeader,
  GamePage,
  HowToRow,
  KeyChip,
  PanelCard,
  PanelTitle,
  PrimaryButton,
  Segmented,
  Stat,
  StatRow,
  ToolButton,
} from "@/components/game-layout";
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

const shareableDifficulties = new Set<Difficulty>(["easy", "medium", "hard", "expert"]);
const shareableModes = new Set<GameMode>(["zen", "three-strikes"]);

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

function isShareablePuzzle(puzzle: string) {
  return /^[1-9.]{81}$/.test(puzzle);
}

function InitialBoardPreview({ puzzle }: { puzzle: string }) {
  const grid = parsePuzzle(puzzle);

  return (
    <div className="grid aspect-square w-full grid-cols-9 border-2 border-stone-900 bg-white">
      {grid.flatMap((row, rowIndex) =>
        row.map((value, colIndex) => {
          const thickTop = rowIndex > 0 && rowIndex % 3 === 0;
          const thickLeft = colIndex > 0 && colIndex % 3 === 0;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="flex items-center justify-center border border-stone-300 text-xl font-bold text-ink sm:text-2xl"
              style={{
                borderTopWidth: thickTop ? "2px" : undefined,
                borderLeftWidth: thickLeft ? "2px" : undefined,
                borderTopColor: thickTop ? "#111827" : undefined,
                borderLeftColor: thickLeft ? "#111827" : undefined,
              }}
            >
              {value === 0 ? <span className="text-transparent">0</span> : value}
            </div>
          );
        }),
      )}
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
  const [showPrintModal, setShowPrintModal] = useState(false);
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
  const printableBoard = useMemo(
    () => (initialPuzzle && isShareablePuzzle(initialPuzzle) ? initialPuzzle : ""),
    [initialPuzzle],
  );
  const printTitle = useMemo(() => `Sudoku - ${difficultyLabel[difficulty]}`, [difficulty, difficultyLabel]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const pushHistory = useCallback((current: Cell[][]) => {
    setHistory((previous) => [...previous.slice(-59), cloneBoard(current)]);
  }, []);

  const loadBoardFromPuzzle = useCallback((puzzle: string, nextDifficulty: Difficulty, nextMode: GameMode) => {
    const solved = solveGrid(parsePuzzle(puzzle));
    if (!solved) {
      setStatus(t("sudoku.status.unsolved"));
      return false;
    }

    const nextBoard = createBoard(puzzle, solved);
    boardRef.current = nextBoard;
    setInitialPuzzle(puzzle);
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
    setStatus("");
    return true;
  }, [t]);

  const startNewGame = useCallback(async (nextDifficulty: Difficulty, nextMode: GameMode) => {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(`/api/sudoku?difficulty=${nextDifficulty}`, { cache: "no-store" });
      if (!response.ok) {
        setStatus(t("sudoku.status.loadFailed"));
        return;
      }

      const data = (await response.json()) as RemotePuzzle;
      if (!loadBoardFromPuzzle(data.puzzle, nextDifficulty, nextMode)) {
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [loadBoardFromPuzzle, t]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sharedPuzzle = searchParams.get("p");
    const sharedDifficulty = searchParams.get("d");
    const sharedMode = searchParams.get("m");

    if (
      sharedPuzzle &&
      isShareablePuzzle(sharedPuzzle) &&
      sharedDifficulty &&
      shareableDifficulties.has(sharedDifficulty as Difficulty) &&
      sharedMode &&
      shareableModes.has(sharedMode as GameMode)
    ) {
      const restored = loadBoardFromPuzzle(
        sharedPuzzle,
        sharedDifficulty as Difficulty,
        sharedMode as GameMode,
      );
      setPendingDifficulty(sharedDifficulty as Difficulty);
      setPendingMode(sharedMode as GameMode);
      setLoading(false);
      if (!restored) {
        setShowNewGameModal(true);
      }
      return;
    }

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
  }, [loadBoardFromPuzzle]);

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

  const shareGame = useCallback(async () => {
    if (!printableBoard) {
      setStatus(t("sudoku.shareUnavailable"));
      return;
    }

    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("p", printableBoard);
      url.searchParams.set("d", difficulty);
      url.searchParams.set("m", gameMode);
      await navigator.clipboard.writeText(url.toString());
      setStatus(t("sudoku.shareCopied"));
    } catch {
      setStatus(t("sudoku.shareUnavailable"));
    }
  }, [difficulty, gameMode, printableBoard, t]);

  const buildShareUrl = useCallback(() => {
    if (!printableBoard) {
      return "";
    }

    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("p", printableBoard);
    url.searchParams.set("d", difficulty);
    url.searchParams.set("m", gameMode);
    return url.toString();
  }, [difficulty, gameMode, printableBoard]);

  const printGame = useCallback(() => {
    const shareUrl = buildShareUrl();
    if (!shareUrl || !printableBoard) {
      setStatus(t("sudoku.shareUnavailable"));
      return;
    }

    const qrUrl = `https://quickchart.io/qr?size=220&margin=1&text=${encodeURIComponent(shareUrl)}`;
    const grid = parsePuzzle(printableBoard);
    const boardMarkup = grid
      .flatMap((row, rowIndex) =>
        row.map((value, colIndex) => {
          const thickTop = rowIndex > 0 && rowIndex % 3 === 0;
          const thickLeft = colIndex > 0 && colIndex % 3 === 0;

          return `<div class="cell${thickTop ? " thick-top" : ""}${thickLeft ? " thick-left" : ""}">${value === 0 ? "&nbsp;" : value}</div>`;
        }),
      )
      .join("");

    const printFrame = document.createElement("iframe");
    printFrame.setAttribute("aria-hidden", "true");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const frameWindow = printFrame.contentWindow;
    const frameDocument = printFrame.contentDocument;
    if (!frameWindow || !frameDocument) {
      document.body.removeChild(printFrame);
      setStatus(t("sudoku.printModal.unavailable"));
      return;
    }

    frameDocument.open();
    frameDocument.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${printTitle}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        background: #ffffff;
        color: #111827;
      }
      .page {
        width: 100%;
        min-height: 100vh;
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 28px;
      }
      .board {
        width: min(100%, 720px);
        aspect-ratio: 1 / 1;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(9, minmax(0, 1fr));
        border: 3px solid #111827;
      }
      .cell {
        border: 1px solid #a8a29e;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 700;
      }
      .thick-top { border-top: 3px solid #111827; }
      .thick-left { border-left: 3px solid #111827; }
      .footer {
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        border-top: 2px solid #e7e5e4;
        padding-top: 24px;
      }
      .brand {
        display: flex;
        align-items: center;
      }
      .brand img {
        width: 180px;
        height: 180px;
        border-radius: 18px;
        object-fit: cover;
      }
      .caption {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 24px;
      }
      .caption-text {
        max-width: 260px;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.4;
        color: #57534e;
        text-align: center;
        white-space: pre-line;
      }
      .qr {
        text-align: center;
        width: 180px;
      }
      .qr img {
        width: 180px;
        height: 180px;
        display: block;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page { padding: 20px; }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:0.04em;">${printTitle}</h1>
      <section class="board">${boardMarkup}</section>
      <footer class="footer">
        <div class="brand">
          <img src="${window.location.origin}/icon.jpeg" alt="Puzzled" />
        </div>
        <div class="caption">
          <div class="caption-text">${t("sudoku.printModal.qrCaption")}</div>
        </div>
        <div class="qr">
          <img src="${qrUrl}" alt="${t("sudoku.printModal.qrAlt")}" />
        </div>
      </footer>
    </main>
    <script>
      window.addEventListener("load", () => {
        window.print();
      });
    </script>
  </body>
</html>`);
    frameDocument.close();

    const cleanup = () => {
      window.setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1000);
    };

    frameWindow.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();
    }, 250);
  }, [buildShareUrl, printTitle, printableBoard, t]);

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
        ArrowUp: { row: selectionAnchor.row === 0 ? 8 : selectionAnchor.row - 1, col: selectionAnchor.col },
        ArrowDown: { row: selectionAnchor.row === 8 ? 0 : selectionAnchor.row + 1, col: selectionAnchor.col },
        ArrowLeft: { row: selectionAnchor.row, col: selectionAnchor.col === 0 ? 8 : selectionAnchor.col - 1 },
        ArrowRight: { row: selectionAnchor.row, col: selectionAnchor.col === 8 ? 0 : selectionAnchor.col + 1 },
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
    <GamePage>
      <GameHeader ns="sudoku" title={t("sudoku.title")}>
        <Segmented
          label={t("sudoku.layout.inputMode")}
          options={[
            { key: "answer", label: t("sudoku.answer"), active: !candidateMode, onClick: () => setCandidateMode(false) },
            { key: "candidates", label: t("sudoku.candidates"), active: candidateMode, onClick: () => setCandidateMode(true) },
          ]}
        />
      </GameHeader>

      <GameBody
        board={
          !board.length ? (
            <div className="flex min-h-[320px] w-full items-center justify-center rounded-2xl border border-dashed border-line-strong bg-ground p-10 text-center text-muted">
              {loading ? t("sudoku.loadingPuzzle") : t("sudoku.emptyState")}
            </div>
          ) : (
            <div className="sudoku-board !w-full !max-w-[640px]" role="grid" aria-label={t("sudoku.boardAriaLabel")}>
              {boardBlocks.map((blockCells, blockIndex) => (
                <div key={blockIndex} className="sudoku-block">
                  {blockCells.map((cell) => {
                    const isSelected = selectedSet.has(coordKey(cell.row, cell.col));
                    const activeHighlightDigit = hoveredDigit ?? selectedValue;
                    const isActiveDigitValue = activeHighlightDigit !== null && cell.value === activeHighlightDigit;
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
                                !isSelected && isActiveDigitValue ? "highlightValueCell" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              style={!isSelected && filtered && !isActiveDigitValue ? { backgroundColor: filterColor } : undefined}
                            >
                              <span
                                className={[
                                  "sudoku-value-content",
                                  selectedValue !== null && cell.value === selectedValue ? "highlightValue" : "",
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
                                          cell.candidates.includes(digit) && selectedValue === digit ? "highlightValue" : "",
                                          cell.candidates.includes(digit) && activeHighlightDigit === digit ? "hoverMatch" : "",
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
          )
        }
        panel={
          <>
            <PanelCard>
              <StatRow>
                <Stat label={t("sudoku.newGameModal.difficulty")} value={difficultyLabel[difficulty]} />
                {gameMode === "three-strikes" ? (
                  <Stat label={t("sudoku.layout.errors")} value={`${Math.min(errors, 3)}/3`} align="end" />
                ) : (
                  <Stat label={t("sudoku.newGameModal.mode")} value={t("sudoku.mode.zen")} align="end" />
                )}
              </StatRow>

              {selectedCells.length > 1 ? (
                <p className="-mt-2 text-[13px] font-semibold text-muted">{selectedCellsLabel}</p>
              ) : null}

              <ActionGrid>
                <ActionButton icon={<Undo2 size={20} />} label={t("sudoku.undo")} onClick={undo} />
                <ActionButton icon={<Delete size={20} />} label={t("sudoku.erase")} onClick={clearCell} />
                <ActionButton
                  icon={<PencilLine size={20} />}
                  label={t("sudoku.layout.notes")}
                  onClick={() => setCandidateMode((value) => !value)}
                  pressed={candidateMode}
                />
                <ActionButton icon={<Lightbulb size={20} />} label={t("sudoku.layout.reveal")} onClick={revealCell} title={t("sudoku.revealCell")} />
              </ActionGrid>

              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }, (_, index) => index + 1).map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => setCellValue(digit)}
                    onMouseEnter={() => setHoveredDigit(digit)}
                    onMouseLeave={() => setHoveredDigit(null)}
                    disabled={boardCounts[digit - 1] >= 9 || loading}
                    className="flex h-14 flex-col items-center justify-center rounded-xl bg-chip text-ink transition hover:bg-sudoku-soft disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="font-display text-2xl font-extrabold leading-none">{digit}</span>
                    <span className="mt-0.5 text-[10px] font-semibold leading-none text-subtle">{boardCounts[digit - 1]}/9</span>
                  </button>
                ))}
              </div>

              <PrimaryButton
                onClick={() => {
                  setPendingDifficulty(difficulty);
                  setPendingMode(gameMode);
                  setShowNewGameModal(true);
                }}
              >
                {t("sudoku.newGame")}
              </PrimaryButton>

              {status ? <p className="text-sm font-semibold text-muted" role="status">{status}</p> : null}
              {loading && board.length ? <p className="text-sm font-semibold text-muted">{t("sudoku.loadingPuzzle")}</p> : null}
            </PanelCard>

            <PanelCard>
              <PanelTitle>{t("sudoku.layout.tools")}</PanelTitle>
              <div className="-mt-2 flex items-center">
                <label htmlFor="auto-check" className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl bg-chip px-3 text-[13px] font-semibold text-ink">
                  {t("sudoku.autoCheck")}
                  <input
                    id="auto-check"
                    type="checkbox"
                    checked={autoCheck}
                    disabled={gameMode === "three-strikes"}
                    onChange={(event) => setAutoCheck(event.target.checked)}
                    className="h-5 w-5 accent-ink"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {!autoCheck ? (
                  <ToolButton icon={<CheckCheck size={18} />} label={t("sudoku.checkCell")} onClick={checkCell} title={t("sudoku.checkCellTitle")} />
                ) : null}
                <ToolButton icon={<Grid3x3 size={18} />} label={t("sudoku.autoCandidate")} onClick={handleAutoCandidateClick} title={t("sudoku.autoCandidateTitle")} />
                <ToolButton icon={<Sparkles size={18} />} label={t("sudoku.promoteSingles")} onClick={singles} />
                <ToolButton
                  icon={<SquareDashedMousePointer size={18} />}
                  label={t("sudoku.multiselect")}
                  onClick={() => setMultiselectMode((value) => !value)}
                  pressed={multiselectMode}
                />
                <ToolButton
                  icon={<Highlighter size={18} />}
                  label={t("sudoku.markCells")}
                  onClick={() => setShowMarkPanel((value) => !value)}
                  pressed={showMarkPanel}
                />
                <ToolButton icon={<WandSparkles size={18} />} label={t("sudoku.solve")} onClick={solve} />
                <ToolButton icon={<RotateCcw size={18} />} label={t("sudoku.reset")} onClick={reset} />
                <ToolButton icon={<Printer size={18} />} label={t("sudoku.print")} onClick={() => setShowPrintModal(true)} />
                <ToolButton icon={<Share2 size={18} />} label={t("sudoku.share")} onClick={() => void shareGame()} />
              </div>

              {showMarkPanel ? (
                <div className="rounded-xl border border-line bg-ground p-3">
                  <p className="text-sm font-semibold text-ink">{t("sudoku.chooseColor")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {markPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => applyMarkColor(color)}
                        style={{ backgroundColor: color }}
                        aria-label={`${t("sudoku.chooseColor")} ${color}`}
                        className="h-11 w-11 rounded-full border border-line-strong"
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2">
                    <button type="button" onClick={() => applyMarkColor(null)} className="min-h-11 rounded-xl bg-surface px-3 py-2 text-sm font-semibold text-ink">
                      {t("sudoku.clearSelected")}
                    </button>
                    <button type="button" onClick={clearAllMarks} className="min-h-11 rounded-xl bg-surface px-3 py-2 text-sm font-semibold text-ink">
                      {t("sudoku.clearAllMarks")}
                    </button>
                  </div>
                </div>
              ) : null}
            </PanelCard>
          </>
        }
        below={
          <>
            <PanelCard>
              <PanelTitle>{t("sudoku.layout.searchTitle")}</PanelTitle>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative w-full">
                    <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={t("sudoku.filterPlaceholder")}
                      aria-label={t("sudoku.filterHelp.title")}
                      className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-3 text-sm text-ink outline-none focus:border-ink"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilterHelp(true)}
                    aria-label={t("sudoku.filterHelp.title")}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white"
                  >
                    <CircleHelp size={18} aria-hidden="true" />
                  </button>
                </div>
                <p className="text-xs leading-5 text-subtle">{t("sudoku.filterHelpers")}</p>
              </div>
            </PanelCard>
            <GameFooter ns="sudoku" articleSlug="sudoku-candidatos-e-singles">
              <p className="text-[15px] leading-relaxed text-muted">{t("sudoku.layout.rules")}</p>
              <HowToRow
                keys={
                  <>
                    <KeyChip>↑ ↓ ← →</KeyChip>
                    <KeyChip>
                      <Mouse size={14} aria-hidden="true" />
                      {t("sudoku.layout.keyMouse")}
                    </KeyChip>
                    <KeyChip>Shift / Ctrl</KeyChip>
                  </>
                }
                text={t("sudoku.controlsBoardNavigation")}
              />
              <HowToRow
                keys={
                  <>
                    <KeyChip>1–9</KeyChip>
                    <KeyChip>Delete</KeyChip>
                  </>
                }
                text={t("sudoku.controlsNumberInput")}
              />
              <HowToRow keys={<KeyChip>{t("sudoku.layout.keySpace")}</KeyChip>} text={t("sudoku.controlsModeSwitch")} />
              <HowToRow text={t("sudoku.controlsHoverHighlight")} />
              <HowToRow
                keys={
                  <KeyChip>
                    <Search size={14} aria-hidden="true" />
                    {t("sudoku.layout.keySearch")}
                  </KeyChip>
                }
                text={t("sudoku.controlsSearch")}
              />
            </GameFooter>
          </>
        }
      />

      {isGameOver ? (
        <BodyPortal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
            <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-card">
              <h2 className="text-center text-2xl font-display font-extrabold text-ink">{t("sudoku.gameOver.title")}</h2>
              <p className="mt-4 text-center text-sm leading-6 text-muted">
                {t("sudoku.gameOver.description")}
              </p>
              <div className="mt-6 grid gap-2">
                <button type="button" onClick={reset} className="rounded-2xl bg-chip px-4 py-3 font-semibold text-ink">
                  {t("sudoku.gameOver.reviewBoard")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingDifficulty(difficulty);
                    setPendingMode(gameMode);
                    setShowNewGameModal(true);
                  }}
                  className="rounded-2xl bg-ink px-4 py-3 font-semibold text-white"
                >
                  {t("sudoku.gameOver.newGame")}
                </button>
              </div>
            </div>
          </div>
        </BodyPortal>
      ) : null}

      {showSuccessModal ? (
        <BodyPortal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
            <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-card">
              <h2 className="text-center text-2xl font-display font-extrabold text-ink">{t("sudoku.success.title")}</h2>
              <p className="mt-4 text-center text-sm leading-6 text-muted">
                {t("sudoku.success.description")}
              </p>
              <div className="mt-6 grid gap-2">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="rounded-2xl bg-chip px-4 py-3 font-semibold text-ink"
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
                  className="rounded-2xl bg-ink px-4 py-3 font-semibold text-white"
                >
                  {t("sudoku.success.newGame")}
                </button>
              </div>
            </div>
          </div>
        </BodyPortal>
      ) : null}

      {showNewGameModal ? (
        <BodyPortal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
            <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-card">
              <h2 className="text-center text-2xl font-display font-extrabold text-ink">{t("sudoku.newGameModal.title")}</h2>
              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-subtle">{t("sudoku.newGameModal.mode")}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingMode("zen")}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold ${pendingMode === "zen" ? "bg-ink text-white" : "bg-chip text-ink"
                      }`}
                  >
                    {t("sudoku.mode.zen")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingMode("three-strikes")}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold ${pendingMode === "three-strikes" ? "bg-ink text-white" : "bg-chip text-ink"
                      }`}
                  >
                    {t("sudoku.mode.threeStrikes")}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-subtle">{t("sudoku.newGameModal.difficulty")}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {difficulties.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPendingDifficulty(item)}
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold ${pendingDifficulty === item ? "bg-sudoku text-ink" : "bg-chip text-ink"
                        }`}
                    >
                      {difficultyLabel[item]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-line" />

              <div className="mt-6 flex gap-2">
                {board.length ? (
                  <button
                    type="button"
                    onClick={() => setShowNewGameModal(false)}
                    disabled={loading}
                    className="w-full rounded-2xl bg-chip px-4 py-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("sudoku.newGameModal.cancel")}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void startNewGame(pendingDifficulty, pendingMode)}
                  disabled={loading}
                  className="w-full rounded-2xl bg-ink px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? t("sudoku.newGameModal.startingGame") : t("sudoku.newGameModal.startGame")}
                </button>
              </div>
            </div>
          </div>
        </BodyPortal>
      ) : null}

      {showAutoCandidateDialog ? (
        <BodyPortal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
            <div className="w-full max-w-sm rounded-[20px] bg-white p-6 shadow-card">
              <h2 className="text-xl font-display font-extrabold text-ink">{t("sudoku.autoCandidatesModal.title")}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t("sudoku.autoCandidatesModal.description")}
              </p>
              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={() => applyAutoCandidates("selected")}
                  className="rounded-2xl bg-ink px-4 py-3 font-semibold text-white"
                >
                  {t("sudoku.autoCandidatesModal.selectedCells")}
                </button>
                <button
                  type="button"
                  onClick={() => applyAutoCandidates("all")}
                  className="rounded-2xl bg-chip px-4 py-3 font-semibold text-ink"
                >
                  {t("sudoku.autoCandidatesModal.wholeBoard")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAutoCandidateDialog(false)}
                  className="rounded-2xl bg-chip px-4 py-3 font-semibold text-ink"
                >
                  {t("sudoku.autoCandidatesModal.cancel")}
                </button>
              </div>
            </div>
          </div>
        </BodyPortal>
      ) : null}

      {showPrintModal ? (
        <BodyPortal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
            <div className="w-full max-w-3xl rounded-[20px] bg-white p-6 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display font-extrabold text-ink">{t("sudoku.printModal.title")}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="rounded-full bg-chip px-3 py-2 text-sm font-semibold text-ink"
                >
                  {t("sudoku.printModal.close")}
                </button>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-line bg-ground p-4">
                <div className="mx-auto max-w-2xl">
                  {printableBoard ? <InitialBoardPreview puzzle={printableBoard} /> : null}
                </div>

                <div className="mt-6 flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
                  <div className="shrink-0 rounded-2xl bg-white p-3 shadow-sm">
                    <img src="/icon.jpeg" alt={t("home.iconAlt")} className="h-32 w-32 rounded-2xl object-cover" />
                  </div>
                  <div className="flex flex-1 items-center justify-center px-2">
                    <p className="max-w-[16rem] whitespace-pre-line text-center text-xs font-semibold leading-5 text-subtle">
                      {t("sudoku.printModal.qrCaption")}
                    </p>
                  </div>
                  {printableBoard ? (
                    <div className="shrink-0 rounded-2xl bg-white p-3 shadow-sm">
                      <img
                        src={`https://quickchart.io/qr?size=220&margin=1&text=${encodeURIComponent(buildShareUrl())}`}
                        alt={t("sudoku.printModal.qrAlt")}
                        className="h-32 w-32"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-full rounded-2xl bg-chip px-4 py-3 font-semibold text-ink"
                >
                  {t("sudoku.printModal.cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    printGame();
                    setShowPrintModal(false);
                  }}
                  className="w-full rounded-2xl bg-ink px-4 py-3 font-semibold text-white"
                >
                  {t("sudoku.printModal.print")}
                </button>
              </div>
            </div>
          </div>
        </BodyPortal>
      ) : null}

      {showFilterHelp ? (
        <BodyPortal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4">
            <div className="w-full max-w-2xl rounded-[20px] bg-white p-6 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-display font-extrabold text-ink">{t("sudoku.filterHelp.title")}</h2>
                <button
                  type="button"
                  onClick={() => setShowFilterHelp(false)}
                  className="rounded-full bg-chip px-3 py-2 text-sm font-semibold text-ink"
                >
                  {t("sudoku.filterHelp.close")}
                </button>
              </div>

              <div className="mt-4 space-y-4 text-sm leading-6 text-ink">
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
        </BodyPortal>
      ) : null}
    </GamePage>
  );
}
