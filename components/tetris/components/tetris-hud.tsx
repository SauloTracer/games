"use client";

import { getPieceMatrix, TETROMINO_COLORS } from "@/components/tetris/game/tetrominos";
import type { PlayerBoardState, TetrisRankingEntry } from "@/components/tetris/game/types";

function MiniMatrix({ type }: { type: PlayerBoardState["holdPiece"] | PlayerBoardState["activePiece"]["type"] | null }) {
  if (!type) {
    return <div className="h-20 rounded-2xl border border-dashed border-white/20 bg-black/10" />;
  }

  const color = TETROMINO_COLORS[type];
  const matrix = getPieceMatrix(type);
  return (
    <div className="grid h-20 grid-cols-4 gap-1 rounded-2xl border border-white/15 bg-black/20 p-2">
      {Array.from({ length: 16 }, (_, index) => {
        const row = Math.floor(index / 4);
        const column = index % 4;
        const filled = matrix[row]?.[column] === 1;
        return (
          <span
            key={index}
            className="rounded-[0.35rem]"
            style={{
              background: filled ? color : "rgba(255,255,255,0.06)",
              opacity: filled ? 1 : 0.35,
            }}
          />
        );
      })}
    </div>
  );
}

export function TetrisHud({
  board,
  bestScore,
  ranking,
  onPauseToggle,
  paused,
}: {
  board: PlayerBoardState;
  bestScore: number;
  ranking: TetrisRankingEntry[];
  onPauseToggle: () => void;
  paused: boolean;
}) {
  return (
    <aside className="grid gap-4">
      <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-black/25 p-4 text-white backdrop-blur">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Pontuação</p>
            <p className="mt-1 text-3xl font-black">{board.score}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Recorde</p>
            <p className="mt-1 text-3xl font-black">{bestScore}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Linhas</p>
            <p className="mt-1 text-2xl font-black">{board.lines}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Nível</p>
            <p className="mt-1 text-2xl font-black">{board.level}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onPauseToggle}
          className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-4 py-3 text-sm font-bold text-cyan-50 transition hover:bg-cyan-400/25"
        >
          {paused ? "Retomar" : "Pausar"}
        </button>
      </div>

      <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-black/25 p-4 text-white backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Próximas peças</p>
          <div className="mt-3 grid gap-2">
            {board.nextQueue.slice(0, 3).map((type, index) => (
              <MiniMatrix key={`${type}-${index}`} type={type} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Hold</p>
          <div className="mt-3">
            <MiniMatrix type={board.holdPiece} />
          </div>
        </div>
      </div>

      <div className="grid gap-2 rounded-[1.75rem] border border-white/10 bg-black/25 p-4 text-white backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Ranking local</p>
        {ranking.length ? (
          ranking.map((entry, index) => (
            <div key={`${entry.playedAt}-${index}`} className="flex items-center justify-between rounded-2xl bg-white/8 px-3 py-2 text-sm">
              <span>#{index + 1}</span>
              <span>{entry.score} pts</span>
              <span>{entry.lines} linhas</span>
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-white/8 px-3 py-3 text-sm text-slate-300">Ainda sem partidas salvas.</p>
        )}
      </div>
    </aside>
  );
}
