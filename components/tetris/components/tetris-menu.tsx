"use client";

type TetrisMenuProps = {
  bestScore: number;
  statusMessage: string;
  onPlay: () => void;
  onSettings: () => void;
  onMultiplayer: () => void;
};

export function TetrisMenu({ bestScore, statusMessage, onPlay, onSettings, onMultiplayer }: TetrisMenuProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-200/70 bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#0f172a_45%,#020617_100%)] p-6 text-white shadow-panel md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.45em] text-cyan-300">Arcade Stack</p>
          <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">Tetris</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
            Complete linhas, acelere o ritmo da queda e mantenha o campo limpo. A estrutura do jogo já separa cada board por
            instância para suportar multiplayer futuramente.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPlay}
              className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              ▶ Jogar
            </button>
            <button
              type="button"
              onClick={onSettings}
              className="rounded-full border border-cyan-300/40 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15"
            >
              ⚙ Configurações
            </button>
            <button
              type="button"
              onClick={onMultiplayer}
              className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/10 px-6 py-3 font-bold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
            >
              👥 Multiplayer
            </button>
          </div>
          {statusMessage ? <p className="rounded-2xl border border-fuchsia-300/25 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-100">{statusMessage}</p> : null}
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-black/25 p-5 backdrop-blur">
          <div className="rounded-[1.25rem] border border-cyan-300/20 bg-cyan-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Recorde Local</p>
            <p className="mt-2 text-4xl font-black">{bestScore}</p>
          </div>
          <div className="grid gap-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-white">Controles</p>
              <p className="mt-2 leading-6">Setas para mover e rotacionar, espaço para hard drop, C para hold e P para pausar.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-white">Roadmap multiplayer</p>
              <p className="mt-2 leading-6">Cada jogador terá grid, fila, hold e eventos independentes. A base já aceita vários boards simultâneos.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
