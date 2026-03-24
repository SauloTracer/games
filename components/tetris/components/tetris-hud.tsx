"use client";

import { useLanguage } from "@/components/language-provider";
import { getPieceMatrix, TETROMINO_COLORS } from "@/components/tetris/game/tetrominos";
import type { PlayerBoardState, TetrisRankingEntry, TetrominoType } from "@/components/tetris/game/types";

function MiniMatrix({ type, compact = false }: { type: TetrominoType | null; compact?: boolean }) {
  if (!type) {
    return <div className={`rounded-2xl border border-dashed border-white/20 bg-black/10 ${compact ? "h-16" : "h-20"}`} />;
  }

  const color = TETROMINO_COLORS[type];
  const matrix = getPieceMatrix(type);
  const filledCells: Array<{ row: number; column: number }> = [];
  matrix.forEach((rowValues, row) => {
    rowValues.forEach((cell, column) => {
      if (cell) {
        filledCells.push({ row, column });
      }
    });
  });

  const minRow = Math.min(...filledCells.map((cell) => cell.row));
  const maxRow = Math.max(...filledCells.map((cell) => cell.row));
  const minColumn = Math.min(...filledCells.map((cell) => cell.column));
  const maxColumn = Math.max(...filledCells.map((cell) => cell.column));
  const width = maxColumn - minColumn + 1;
  const height = maxRow - minRow + 1;

  return (
    <div className={`flex items-center justify-center rounded-2xl border border-white/15 bg-black/20 p-3 ${compact ? "min-h-16" : "min-h-20"}`}>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: width * height }, (_, index) => {
          const row = Math.floor(index / width);
          const column = index % width;
          const filled = matrix[minRow + row]?.[minColumn + column] === 1;
          return (
            <span
              key={index}
              className={`rounded-[0.35rem] ${compact ? "h-5 w-5" : "h-6 w-6"}`}
              style={{
                background: filled ? color : "rgba(255,255,255,0.05)",
                opacity: filled ? 1 : 0.3,
                boxShadow: filled ? "inset 0 2px 0 rgba(255,255,255,0.3)" : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function TetrisHud({
  board,
  bestScore,
  ranking,
  onPauseToggle,
  paused,
  holdEnabled,
  showNextQueue,
  previewCount,
}: {
  board: PlayerBoardState;
  bestScore: number;
  ranking: TetrisRankingEntry[];
  onPauseToggle: () => void;
  paused: boolean;
  holdEnabled: boolean;
  showNextQueue: boolean;
  previewCount: 1 | 2 | 3;
}) {
  const { t } = useLanguage();

  return (
    <aside className="hidden gap-4 md:grid">
      <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-black/25 p-4 text-white backdrop-blur">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">{t("tetris.hud.score")}</p>
            <p className="mt-1 text-3xl font-black">{board.score}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">{t("tetris.hud.bestScore")}</p>
            <p className="mt-1 text-3xl font-black">{bestScore}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">{t("tetris.hud.lines")}</p>
            <p className="mt-1 text-2xl font-black">{board.lines}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">{t("tetris.hud.level")}</p>
            <p className="mt-1 text-2xl font-black">{board.level}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onPauseToggle}
          className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-4 py-3 text-sm font-bold text-cyan-50 transition hover:bg-cyan-400/25"
        >
          {paused ? t("tetris.hud.resume") : t("tetris.hud.pause")}
        </button>
      </div>

      <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-black/25 p-4 text-white backdrop-blur">
        {showNextQueue ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">{t("tetris.hud.nextPieces")}</p>
            <div className="mt-3 grid gap-2">
              {board.nextQueue.slice(0, previewCount).map((type, index) => (
                <MiniMatrix key={`${type}-${index}`} type={type} compact={index > 0} />
              ))}
            </div>
          </div>
        ) : null}
        {holdEnabled ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">{t("tetris.hud.hold")}</p>
            <div className="mt-3">
              <MiniMatrix type={board.holdPiece} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 rounded-[1.75rem] border border-white/10 bg-black/25 p-4 text-white backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">{t("tetris.hud.localRanking")}</p>
        {ranking.length ? (
          ranking.map((entry, index) => (
            <div key={`${entry.playedAt}-${index}`} className="flex items-center justify-between rounded-2xl bg-white/8 px-3 py-2 text-sm">
              <span>#{index + 1}</span>
              <span>{t("tetris.hud.rankingScore").replace("{score}", String(entry.score))}</span>
              <span>{t("tetris.hud.rankingLines").replace("{lines}", String(entry.lines))}</span>
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-white/8 px-3 py-3 text-sm text-slate-300">{t("tetris.hud.noRanking")}</p>
        )}
      </div>
    </aside>
  );
}
