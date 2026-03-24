"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { getGhostPiece, TETRIS_COLUMNS, TETRIS_ROWS } from "@/components/tetris/game/engine";
import { TETROMINO_COLORS } from "@/components/tetris/game/tetrominos";
import type { GameInstance, PlayerBoardState, ThemeMode } from "@/components/tetris/game/types";

function drawCell(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fillRect(x + 1.5, y + 1.5, size - 3, size - 3);
  context.fillStyle = "rgba(255,255,255,0.25)";
  context.fillRect(x + 3.5, y + 3.5, size - 7, Math.max(5, size * 0.18));
  context.restore();
}

function paintBoard(context: CanvasRenderingContext2D, board: PlayerBoardState, cellSize: number, theme: ThemeMode, showGhostPiece: boolean, gameOverLabel: string) {
  const background = theme === "arcade-dark" ? "#020617" : "#fff7ed";
  const gridStroke = theme === "arcade-dark" ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)";
  const emptyFill = theme === "arcade-dark" ? "#07111f" : "#fffdf8";
  const textColor = theme === "arcade-dark" ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.78)";

  context.clearRect(0, 0, cellSize * TETRIS_COLUMNS, cellSize * TETRIS_ROWS);
  context.fillStyle = background;
  context.fillRect(0, 0, cellSize * TETRIS_COLUMNS, cellSize * TETRIS_ROWS);

  for (let row = 0; row < TETRIS_ROWS; row += 1) {
    for (let column = 0; column < TETRIS_COLUMNS; column += 1) {
      const x = column * cellSize;
      const y = row * cellSize;
      context.fillStyle = emptyFill;
      context.fillRect(x, y, cellSize, cellSize);
      context.strokeStyle = gridStroke;
      context.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
      const value = board.grid[row][column];
      const flashing = board.clearingRows.includes(row) ? 0.35 + 0.65 * Math.abs(Math.sin(board.clearAnimationMs / 22)) : 1;
      if (value) {
        drawCell(context, x, y, cellSize, TETROMINO_COLORS[value], flashing);
      }
    }
  }

  if (showGhostPiece && !board.clearingRows.length && !board.gameOver) {
    const ghost = getGhostPiece(board);
    ghost.matrix.forEach((line, row) => {
      line.forEach((cell, column) => {
        if (!cell) {
          return;
        }
        const x = (ghost.x + column) * cellSize;
        const y = (ghost.y + row) * cellSize;
        if (ghost.y + row >= 0) {
          drawCell(context, x, y, cellSize, TETROMINO_COLORS[ghost.type], 0.2);
        }
      });
    });
  }

  board.activePiece.matrix.forEach((line, row) => {
    line.forEach((cell, column) => {
      if (!cell) {
        return;
      }
      const x = (board.activePiece.x + column) * cellSize;
      const y = (board.activePiece.y + row) * cellSize;
      if (board.activePiece.y + row >= 0) {
        drawCell(context, x, y, cellSize, TETROMINO_COLORS[board.activePiece.type]);
      }
    });
  });

  if (board.gameOver) {
    context.fillStyle = "rgba(2,6,23,0.68)";
    context.fillRect(0, 0, cellSize * TETRIS_COLUMNS, cellSize * TETRIS_ROWS);
    context.fillStyle = textColor;
    context.font = "700 28px 'Trebuchet MS', sans-serif";
    context.textAlign = "center";
    context.fillText(gameOverLabel, (cellSize * TETRIS_COLUMNS) / 2, (cellSize * TETRIS_ROWS) / 2);
  }
}

export function TetrisCanvas({
  instance,
  settings,
}: {
  instance: GameInstance;
  settings: { theme: ThemeMode; showGhostPiece: boolean };
}) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(340);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const updateBoardWidth = () => {
      const isMobile = window.innerWidth < 768;
      const containerWidth = frame.clientWidth;
      const mobileMaxHeight = Math.max(320, window.innerHeight - 250);
      const nextWidth = isMobile
        ? Math.max(180, Math.min(containerWidth, mobileMaxHeight / 2, 340))
        : Math.max(260, Math.min(containerWidth, 340));
      setBoardWidth(Math.floor(nextWidth));
    };

    updateBoardWidth();
    const observer = new ResizeObserver(() => updateBoardWidth());
    observer.observe(frame);
    window.addEventListener("resize", updateBoardWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateBoardWidth);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    const width = boardWidth;
    const height = boardWidth * 2;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    paintBoard(context, instance.board, width / TETRIS_COLUMNS, settings.theme, settings.showGhostPiece, t("tetris.gameOver.title").toUpperCase());
  }, [boardWidth, instance, settings, t]);

  return (
    <div ref={frameRef} className="rounded-[1.75rem] border border-white/10 bg-black/25 p-3 backdrop-blur">
      <div className="mb-3 hidden items-center justify-between gap-3 text-sm font-semibold text-slate-200 md:flex">
        <span>{instance.board.name}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em]">
          {instance.controlMode === "local" ? t("tetris.canvas.local") : t("tetris.canvas.remote")}
        </span>
      </div>
      <canvas ref={canvasRef} width={340} height={680} className="mx-auto block max-w-full rounded-[1.25rem] shadow-2xl" />
    </div>
  );
}
