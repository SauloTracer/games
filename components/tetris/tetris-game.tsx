"use client";

import { TetrisCanvas } from "@/components/tetris/components/tetris-canvas";
import { TetrisHud } from "@/components/tetris/components/tetris-hud";
import { TetrisMenu } from "@/components/tetris/components/tetris-menu";
import { TetrisSettingsPanel } from "@/components/tetris/components/tetris-settings-panel";
import type { ThemeMode } from "@/components/tetris/game/types";
import { useTetrisGame } from "@/components/tetris/hooks/use-tetris-game";

function MobileControls({
  onLeft,
  onRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onHold,
  theme,
}: {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  theme: ThemeMode;
}) {
  const buttonClassName =
    theme === "arcade-dark"
      ? "rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm font-bold text-white transition active:scale-[0.98]"
      : "rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-bold text-stone-900 transition active:scale-[0.98]";

  return (
    <div className="grid gap-3 md:hidden">
      <div className="grid grid-cols-3 gap-3">
        <button type="button" onClick={onLeft} className={buttonClassName}>
          ←
        </button>
        <button type="button" onClick={onRotate} className={buttonClassName}>
          ↻
        </button>
        <button type="button" onClick={onRight} className={buttonClassName}>
          →
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button type="button" onClick={onHold} className={buttonClassName}>
          Hold
        </button>
        <button type="button" onClick={onSoftDrop} className={buttonClassName}>
          ↓
        </button>
        <button type="button" onClick={onHardDrop} className={buttonClassName}>
          Drop
        </button>
      </div>
    </div>
  );
}

export function TetrisGame() {
  const {
    activeInstance,
    bestScore,
    ranking,
    roomDraft,
    screen,
    settings,
    statusMessage,
    closeSettings,
    goToMenu,
    handleMultiplayerPlaceholder,
    hardDrop,
    hold,
    moveLeft,
    moveRight,
    openSettings,
    restartGame,
    rotate,
    softDrop,
    startGame,
    togglePause,
    updateSettingsField,
  } = useTetrisGame();

  if (screen === "menu") {
    return (
      <TetrisMenu
        bestScore={bestScore}
        statusMessage={statusMessage}
        onPlay={() => void startGame()}
        onSettings={openSettings}
        onMultiplayer={handleMultiplayerPlaceholder}
      />
    );
  }

  if (screen === "settings") {
    return <TetrisSettingsPanel settings={settings} onBack={closeSettings} onFieldChange={updateSettingsField} />;
  }

  if (!activeInstance) {
    return null;
  }

  return (
    <section
      className={`rounded-[2rem] border p-4 shadow-panel backdrop-blur md:p-6 ${
        settings.theme === "arcade-dark"
          ? "border-cyan-200/10 bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#0f172a_42%,#020617_100%)] text-white"
          : "border-amber-200/70 bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fff7ed_48%,#fffbeb_100%)] text-stone-900"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.35em] ${settings.theme === "arcade-dark" ? "text-cyan-300" : "text-amber-700"}`}>
            Single Player Ready for Multiplayer
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Tetris Canvas</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goToMenu}
            className={`rounded-full px-4 py-3 text-sm font-bold transition ${
              settings.theme === "arcade-dark" ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-stone-800 hover:bg-stone-100"
            }`}
          >
            Menu
          </button>
          <button
            type="button"
            onClick={openSettings}
            className={`rounded-full px-4 py-3 text-sm font-bold transition ${
              settings.theme === "arcade-dark" ? "bg-cyan-400/15 text-cyan-50 hover:bg-cyan-400/25" : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
          >
            Configurações
          </button>
        </div>
      </div>

      {statusMessage ? (
        <p
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            settings.theme === "arcade-dark" ? "border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-100" : "border-amber-300 bg-amber-100 text-amber-900"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <TetrisCanvas instance={activeInstance} settings={{ theme: settings.theme, showGhostPiece: settings.showGhostPiece }} />
            <div className="grid gap-4">
              <div className={`rounded-[1.75rem] border p-4 ${settings.theme === "arcade-dark" ? "border-white/10 bg-black/25" : "border-amber-200 bg-white/80"}`}>
                <p className="text-sm font-bold">Controles</p>
                <div className="mt-3 grid gap-2 text-sm leading-6">
                  <p>← → mover</p>
                  <p>↑ rotacionar</p>
                  <p>↓ queda rápida</p>
                  <p>Espaço hard drop</p>
                  <p>C hold</p>
                  <p>P pausar</p>
                </div>
              </div>
              <div className={`rounded-[1.75rem] border p-4 ${settings.theme === "arcade-dark" ? "border-white/10 bg-black/25" : "border-amber-200 bg-white/80"}`}>
                <p className="text-sm font-bold">Multiplayer draft</p>
                <div className="mt-3 grid gap-2 text-sm leading-6">
                  <p>Sala: {roomDraft.roomId ?? "offline/local"}</p>
                  <p>Jogadores: {roomDraft.players.length}</p>
                  <p>Linha de lixo: {roomDraft.garbageQueueEnabled ? "preparada" : "desligada"}</p>
                </div>
              </div>
            </div>
          </div>

          <MobileControls onLeft={moveLeft} onRight={moveRight} onRotate={rotate} onSoftDrop={softDrop} onHardDrop={hardDrop} onHold={hold} theme={settings.theme} />

          {(screen === "paused" || screen === "game-over") && (
            <div
              className={`rounded-[1.75rem] border p-5 ${
                settings.theme === "arcade-dark" ? "border-white/10 bg-black/30 text-white" : "border-amber-200 bg-white/90 text-stone-900"
              }`}
            >
              <h2 className="text-3xl font-black">{screen === "paused" ? "Jogo pausado" : "Game Over"}</h2>
              <p className="mt-3 text-sm leading-6">
                {screen === "paused"
                  ? "Retome quando estiver pronto para continuar a sequência."
                  : `Pontuação final ${activeInstance.board.score}.`}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={screen === "paused" ? togglePause : () => void restartGame()}
                  className={`rounded-full px-5 py-3 font-bold transition ${
                    settings.theme === "arcade-dark" ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300" : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  {screen === "paused" ? "Continuar" : "Jogar novamente"}
                </button>
                <button
                  type="button"
                  onClick={goToMenu}
                  className={`rounded-full px-5 py-3 font-bold transition ${
                    settings.theme === "arcade-dark" ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  Menu
                </button>
                <button
                  type="button"
                  onClick={openSettings}
                  className={`rounded-full px-5 py-3 font-bold transition ${
                    settings.theme === "arcade-dark" ? "bg-fuchsia-500/15 text-fuchsia-100 hover:bg-fuchsia-500/25" : "bg-stone-900 text-white hover:bg-stone-800"
                  }`}
                >
                  Configurações
                </button>
              </div>
            </div>
          )}
        </div>

        <TetrisHud board={activeInstance.board} bestScore={bestScore} ranking={ranking} paused={screen === "paused"} onPauseToggle={togglePause} />
      </div>
    </section>
  );
}
