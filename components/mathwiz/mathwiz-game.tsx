"use client";

import { Sparkles, Heart, Droplets, Flame, WandSparkles, Trash2, Snowflake, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMathWizGame } from "@/components/mathwiz/hooks/use-mathwiz-game";
import type { MathWizRun, Operator, SpellType, StackState, Token, Upgrade } from "@/components/mathwiz/game/types";

const operatorColors: Record<Operator, string> = {
  "+": "bg-white text-slate-900",
  "-": "bg-white text-slate-900",
  "*": "bg-amber-300 text-amber-950",
  "/": "bg-amber-300 text-amber-950",
  "%": "bg-fuchsia-300 text-fuchsia-950",
  sqrt: "bg-emerald-300 text-emerald-950",
  "^": "bg-sky-300 text-sky-950",
  "!": "bg-orange-300 text-orange-950",
  "!!": "bg-orange-300 text-orange-950",
};

function SpellIcon({ type }: { type: SpellType }) {
  if (type === "flip") {
    return <RefreshCcw size={16} />;
  }
  if (type === "clearTop") {
    return <Trash2 size={16} />;
  }
  return <Snowflake size={16} />;
}

function TokenChip({
  token,
  formatToken,
  onClick,
}: {
  token: Token;
  formatToken: (token: Token) => string;
  onClick?: () => void;
}) {
  const className =
    token.kind === "number"
      ? `inline-flex min-w-12 items-center justify-center rounded-xl px-3 py-2 text-sm font-black ${token.value * token.sign >= 0 ? "bg-sky-200 text-sky-950" : "bg-rose-200 text-rose-950"}`
      : `inline-flex min-w-12 items-center justify-center rounded-xl px-3 py-2 text-sm font-black ${operatorColors[token.op]}`;

  if (token.kind === "number") {
    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={`${className} transition hover:scale-[1.02] hover:brightness-110`}>
          {formatToken(token)}
        </button>
      );
    }

    return <span className={className}>{formatToken(token)}</span>;
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} transition hover:scale-[1.02] hover:brightness-110`}>
        {formatToken(token)}
      </button>
    );
  }

  return <span className={className}>{formatToken(token)}</span>;
}

function StackCard({
  stack,
  selected,
  onTake,
  formatToken,
  title,
  emptyLabel,
}: {
  stack: StackState;
  selected: boolean;
  onTake: () => void;
  formatToken: (token: Token) => string;
  title: string;
  emptyLabel: string;
}) {
  const top = stack.items[stack.items.length - 1];
  const warning = stack.items.length >= stack.maxHeight;

  return (
    <button
      type="button"
      onClick={onTake}
      className={`grid gap-2 rounded-[1.5rem] border p-3 text-left transition ${
        selected
          ? "border-cyan-300 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(103,232,249,0.4)]"
          : warning
            ? "border-rose-300 bg-rose-300/10"
            : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-300">{title}</span>
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${warning ? "bg-rose-400 text-white" : "bg-white/10 text-slate-200"}`}>
          {stack.items.length}/{stack.maxHeight}
        </span>
      </div>

      <div className="grid min-h-24 content-end gap-1 rounded-[1.25rem] bg-black/20 p-2">
        {stack.items.slice(-4).map((token) => (
          <TokenChip key={token.id} token={token} formatToken={formatToken} />
        ))}
      </div>

      {top ? <span className="text-xs text-slate-300">{formatToken(top)}</span> : <span className="text-xs text-slate-500">{emptyLabel}</span>}
    </button>
  );
}

function UpgradeCard({ upgrade, onPick, label }: { upgrade: Upgrade; onPick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="rounded-[1.5rem] border border-cyan-300/30 bg-cyan-300/10 p-4 text-left transition hover:border-cyan-200 hover:bg-cyan-300/15"
    >
      <p className="font-bold text-white">{label}</p>
    </button>
  );
}

function formatBestRunLabel(t: (key: string) => string, run: MathWizRun | null) {
  if (!run) {
    return null;
  }

  return t("mathwiz.menu.bestRunLabel")
    .replace("{level}", String(run.level))
    .replace("{casts}", String(run.stableSpells))
    .replace("{combo}", String(run.highestCombo));
}

export function MathWizGame() {
  const { messages } = useLanguage();
  const {
    screen,
    settings,
    state,
    bestRun,
    spellDefinitions,
    previewValues,
    canCast,
    formatToken,
    startRun,
    goToMenu,
    setActiveSide,
    selectStack,
    useSpell,
    cast,
    resetEquation,
    returnTokenToStack,
    chooseLevelUpgrade,
    updateSettingsField,
  } = useMathWizGame();
  const tm = (key: string) =>
    key.split(".").reduce<unknown>((current, part) => {
      if (!current || typeof current !== "object" || !(part in current)) {
        return undefined;
      }

      return (current as Record<string, unknown>)[part];
    }, messages.mathwiz);
  const text = (key: string) => (typeof tm(key) === "string" ? (tm(key) as string) : key);
  const translateStatusKey = (key: string) => (key.startsWith("mathwiz.") ? text(key.slice("mathwiz.".length)) : key);
  const bestRunLabel = formatBestRunLabel((key) => (key.startsWith("mathwiz.") ? translateStatusKey(key) : key), bestRun);
  const statusTitle = translateStatusKey(state.status.titleKey);
  const statusDetail = state.status.detailText
    ? state.status.detailText
    : state.status.detailKey
      ? Object.entries(state.status.detailValues ?? {}).reduce(
          (message, [key, value]) => message.replace(`{${key}}`, String(value)),
          translateStatusKey(state.status.detailKey),
        )
      : "";

  if (screen === "menu") {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,#312e81_0%,#111827_45%,#020617_100%)] p-6 text-white shadow-panel md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{text("kicker")}</p>
            <h1 className="text-5xl font-black tracking-tight md:text-7xl">{text("title")}</h1>
            <p className="max-w-2xl whitespace-pre-line text-base leading-7 text-slate-200 md:text-lg">{text("menu.subtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={startRun} className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">
                {text("menu.play")}
              </button>
            </div>
          </div>
          <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
            <div className="rounded-[1.25rem] border border-cyan-300/20 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">{text("menu.bestRun")}</p>
              <p className="mt-2 text-lg font-black">{bestRunLabel ?? text("menu.noBestRun")}</p>
            </div>
            <div className="grid gap-3 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-bold text-white">{text("menu.loopTitle")}</p>
                <p className="mt-2 leading-6">{text("menu.loopBody")}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-bold text-white">{text("menu.rulesTitle")}</p>
                <p className="mt-2 leading-6">{text("menu.rulesBody")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const stackTitle = (stack: StackState, index: number) =>
    stack.type === "number" ? text("stacks.number").replace("{index}", String(index + 1)) : text("stacks.operator").replace("{index}", String(index + 1));

  return (
    <section className="rounded-[2rem] border border-indigo-200/20 bg-[radial-gradient(circle_at_top,#312e81_0%,#111827_48%,#020617_100%)] p-4 text-white shadow-panel md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{text("kicker")}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{text("title")}</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => updateSettingsField("showResultPreview", !settings.showResultPreview)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
            {settings.showResultPreview ? text("settings.previewOn") : text("settings.previewOff")}
          </button>
          <button type="button" onClick={goToMenu} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
            {text("game.menu")}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-rose-300/20 bg-rose-400/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-rose-200">
              <Heart size={18} />
              <span className="text-xs uppercase tracking-[0.28em]">{text("top.hp")}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-rose-400" style={{ width: `${(state.health.hp / state.health.maxHp) * 100}%` }} />
            </div>
            <p className="mt-2 text-lg font-black">{state.health.hp}/{state.health.maxHp}</p>
          </div>
          <div className="rounded-[1.5rem] border border-sky-300/20 bg-sky-400/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-sky-200">
              <Droplets size={18} />
              <span className="text-xs uppercase tracking-[0.28em]">{text("top.mana")}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-sky-400" style={{ width: `${(state.mana.mana / state.mana.maxMana) * 100}%` }} />
            </div>
            <p className="mt-2 text-lg font-black">{state.mana.mana}/{state.mana.maxMana}</p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-400/10 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-amber-200">
              <Flame size={18} />
              <span className="text-xs uppercase tracking-[0.28em]">{text("top.combo")}</span>
            </div>
            <p className="mt-4 text-3xl font-black">x{state.comboMultiplier.toFixed(1)}</p>
            <p className="mt-1 text-sm text-amber-100">{text("top.comboCount").replace("{count}", String(state.comboCount))}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">{text("sections.numberStacks")}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {state.numberStacks.map((stack, index) => (
                    <StackCard
                      key={stack.id}
                      stack={stack}
                      selected={state.selected.stackId === stack.id}
                      onTake={() => selectStack(stack.id, state.selected.side)}
                      formatToken={formatToken}
                      title={stackTitle(stack, index)}
                      emptyLabel={text("builder.empty")}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">{text("sections.operatorStacks")}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {state.operatorStacks.map((stack, index) => (
                    <StackCard
                      key={stack.id}
                      stack={stack}
                      selected={state.selected.stackId === stack.id}
                      onTake={() => selectStack(stack.id, state.selected.side)}
                      formatToken={formatToken}
                      title={stackTitle(stack, index)}
                      emptyLabel={text("builder.empty")}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={`rounded-[1.75rem] border p-5 transition ${canCast ? "border-emerald-300/40 bg-emerald-300/10 shadow-[0_0_25px_rgba(74,222,128,0.15)]" : "border-white/10 bg-white/5"} backdrop-blur`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">{text("sections.builder")}</p>
                  <p className="mt-2 text-sm text-slate-300">{statusTitle}: {statusDetail}</p>
                </div>
                <button type="button" onClick={resetEquation} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                  {text("game.reset")}
                </button>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
                <button type="button" onClick={() => setActiveSide("left")} className={`rounded-[1.5rem] border p-4 text-left ${state.selected.side === "left" ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-black/20"}`}>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{text("builder.left")}</p>
                  <div className="mt-3 flex min-h-16 flex-wrap gap-2">
                    {state.equation.left.length ? state.equation.left.map((token) => <TokenChip key={token.id} token={token} formatToken={formatToken} onClick={() => returnTokenToStack("left", token.id)} />) : <span className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-500">{text("builder.empty")}</span>}
                  </div>
                  {settings.showResultPreview && previewValues.left !== null ? <p className="mt-3 text-sm text-cyan-200">{text("builder.preview").replace("{value}", String(previewValues.left))}</p> : null}
                </button>

                <div className="flex items-center justify-center text-4xl font-black text-cyan-200">=</div>

                <button type="button" onClick={() => setActiveSide("right")} className={`rounded-[1.5rem] border p-4 text-left ${state.selected.side === "right" ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-black/20"}`}>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{text("builder.right")}</p>
                  <div className="mt-3 flex min-h-16 flex-wrap gap-2">
                    {state.equation.right.length ? state.equation.right.map((token) => <TokenChip key={token.id} token={token} formatToken={formatToken} onClick={() => returnTokenToStack("right", token.id)} />) : <span className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-500">{text("builder.empty")}</span>}
                  </div>
                  {settings.showResultPreview && previewValues.right !== null ? <p className="mt-3 text-sm text-cyan-200">{text("builder.preview").replace("{value}", String(previewValues.right))}</p> : null}
                </button>
              </div>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <WandSparkles size={18} className="text-cyan-200" />
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">{text("sections.spells")}</p>
              </div>
              <div className="mt-4 grid gap-3">
                {spellDefinitions.map((spell) => (
                  <button
                    key={spell.type}
                    type="button"
                    onClick={() => useSpell(spell.type)}
                    disabled={state.mana.mana < spell.manaCost || !state.selected.stackId}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left disabled:opacity-40"
                  >
                    <span className="inline-flex items-center gap-2">
                      <SpellIcon type={spell.type} />
                      {text(`spells.${spell.type}.name`)}
                    </span>
                    <span className="text-sm text-sky-200">{text("spells.cost").replace("{cost}", String(spell.manaCost))}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={cast}
              disabled={!canCast}
              className={`rounded-[1.75rem] px-5 py-5 text-left transition ${canCast ? "bg-[linear-gradient(135deg,#8b5cf6,#06b6d4)] shadow-[0_0_28px_rgba(139,92,246,0.45)]" : "bg-white/10 opacity-50"}`}
            >
              <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-white/80">
                <Sparkles size={18} />
                {canCast ? text("cast.ready") : text("cast.incomplete")}
              </span>
              <p className="mt-3 text-3xl font-black">{text("cast.action")}</p>
            </button>

            <div className={`rounded-[1.75rem] border p-4 ${state.status.tone === "success" ? "border-emerald-300/30 bg-emerald-400/10" : state.status.tone === "error" ? "border-rose-300/30 bg-rose-400/10" : "border-white/10 bg-white/5"} backdrop-blur`}>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-200">{text("sections.feedback")}</p>
              <p className="mt-3 text-lg font-black">{statusTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{statusDetail}</p>
            </div>
          </aside>
        </div>
      </div>

      {state.pendingUpgrades.length ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_top,#0f172a,#020617)] p-6 text-white shadow-panel">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{text("upgrade.kicker")}</p>
            <h2 className="mt-3 text-3xl font-black">{text("upgrade.title")}</h2>
            <div className="mt-6 grid gap-3">
              {state.pendingUpgrades.map((upgrade) => {
                const label =
                  upgrade.type === "unlockOperator"
                    ? text("upgrade.unlock").replace("{operator}", upgrade.operator)
                    : text(`upgrade.${upgrade.type}`);
                return <UpgradeCard key={label} upgrade={upgrade} onPick={() => chooseLevelUpgrade(upgrade)} label={label} />;
              })}
            </div>
          </div>
        </div>
      ) : null}

      {screen === "game-over" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-xl rounded-[2rem] border border-rose-300/20 bg-[radial-gradient(circle_at_top,#1f2937,#020617)] p-6 text-white shadow-panel">
            <h2 className="text-3xl font-black">{text("gameOver.title")}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-200">{text("gameOver.description").replace("{level}", String(state.level)).replace("{casts}", String(state.stableSpells))}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold">{text("top.hp")} {state.health.hp}</div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold">{text("top.combo")} {state.comboCount}</div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold">{text("top.mana")} {state.mana.mana}</div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={startRun} className="rounded-full bg-cyan-400 px-5 py-3 font-bold text-slate-950">{text("gameOver.retry")}</button>
              <button type="button" onClick={goToMenu} className="rounded-full bg-white/10 px-5 py-3 font-bold text-white">{text("gameOver.menu")}</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
