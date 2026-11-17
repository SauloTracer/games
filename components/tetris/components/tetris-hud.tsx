"use client";

import { Stat } from "@/components/game-layout";
import { useLanguage } from "@/components/language-provider";
import { getPieceMatrix, TETROMINO_COLORS } from "@/components/tetris/game/tetrominos";
import type { PlayerBoardState, TetrisRankingEntry, TetrominoType } from "@/components/tetris/game/types";

function MiniMatrix({ type, compact = false }: { type: TetrominoType | null; compact?: boolean }) {
  if (!type) {
    return <div className={`rounded-xl border border-dashed border-line-strong bg-chip ${compact ? "h-16" : "h-20"}`} />;
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
    <div className={`flex items-center justify-center rounded-xl bg-ink p-3 ${compact ? "min-h-16" : "min-h-20"}`}>
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
              className={`rounded-[0.35rem] ${compact ? "h-4 w-4" : "h-5 w-5"}`}
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

export function TetrisHud({ board, bestScore }: { board: PlayerBoardState | null; bestScore: number }) {
  const { t } = useLanguage();

  if (!board) {
    return (
      <div className="flex items-center justify-between gap-4">
        <Stat label={t("tetris.hud.bestScore")} value={bestScore} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <Stat label={t("tetris.hud.score")} value={board.score} />
      <Stat label={t("tetris.hud.bestScore")} value={bestScore} align="end" />
      <Stat label={t("tetris.hud.lines")} value={board.lines} />
      <Stat label={t("tetris.hud.level")} value={board.level} align="end" />
    </div>
  );
}

export function TetrisQueue({
  board,
  holdEnabled,
  showNextQueue,
  previewCount,
}: {
  board: PlayerBoardState;
  holdEnabled: boolean;
  showNextQueue: boolean;
  previewCount: 1 | 2 | 3;
}) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-3">
      {showNextQueue ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">{t("tetris.hud.nextPieces")}</p>
          <div className="mt-2 grid gap-2">
            {board.nextQueue.slice(0, previewCount).map((type, index) => (
              <MiniMatrix key={`${type}-${index}`} type={type} compact />
            ))}
          </div>
        </div>
      ) : null}
      {holdEnabled ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">{t("tetris.hud.hold")}</p>
          <div className="mt-2">
            <MiniMatrix type={board.holdPiece} compact />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TetrisRanking({ ranking }: { ranking: TetrisRankingEntry[] }) {
  const { t } = useLanguage();

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">{t("tetris.hud.localRanking")}</p>
      {ranking.length ? (
        <div className="grid gap-1.5">
          {ranking.map((entry, index) => (
            <div key={`${entry.playedAt}-${index}`} className="flex items-center justify-between gap-2 rounded-xl bg-chip px-3 py-2 text-sm text-ink">
              <span className="font-bold">#{index + 1}</span>
              <span>{t("tetris.hud.rankingScore").replace("{score}", String(entry.score))}</span>
              <span className="text-muted">{t("tetris.hud.rankingLines").replace("{lines}", String(entry.lines))}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-chip px-3 py-3 text-sm text-muted">{t("tetris.hud.noRanking")}</p>
      )}
    </>
  );
}
