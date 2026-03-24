"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applySpell,
  castEquation,
  chooseUpgrade,
  clearEquation,
  createInitialMathWizState,
  formatToken,
  getPreviewValues,
  getSpellDefinitions,
  returnEquationToken,
  setSelection,
  takeTopFromStack,
  tickTurnTimer,
} from "@/components/mathwiz/game/engine";
import type { EquationSide, MathWizRun, MathWizScreen, MathWizSettings, MathWizState, SpellType, Upgrade } from "@/components/mathwiz/game/types";
import {
  defaultMathWizSettings,
  loadBestMathWizRun,
  loadMathWizSettings,
  saveBestMathWizRun,
  saveMathWizSettings,
} from "@/components/mathwiz/services/storage";

export function useMathWizGame() {
  const [screen, setScreen] = useState<MathWizScreen>("menu");
  const [settings, setSettings] = useState<MathWizSettings>(defaultMathWizSettings);
  const [state, setState] = useState<MathWizState>(() => createInitialMathWizState(defaultMathWizSettings));
  const [bestRun, setBestRun] = useState<MathWizRun | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const loadedSettings = loadMathWizSettings();
    setSettings(loadedSettings);
    setState(createInitialMathWizState(loadedSettings));
    setBestRun(loadBestMathWizRun());
  }, []);

  useEffect(() => {
    saveMathWizSettings(settings);
  }, [settings]);

  const stopLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastFrameRef.current = null;
  }, []);

  useEffect(() => {
    if (screen !== "playing") {
      stopLoop();
      return;
    }

    const loop = (timestamp: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }
      const delta = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      setState((current) => (current.pendingUpgrades.length || current.gameOver ? current : tickTurnTimer(current, delta)));
      animationFrameRef.current = window.requestAnimationFrame(loop);
    };

    animationFrameRef.current = window.requestAnimationFrame(loop);
    return stopLoop;
  }, [screen, stopLoop]);

  useEffect(() => {
    if (!state.gameOver) {
      return;
    }
    const run: MathWizRun = {
      level: state.level,
      stableSpells: state.stableSpells,
      failedSpells: state.failedSpells,
      highestCombo: state.comboCount,
      finalHp: state.health.hp,
    };
    saveBestMathWizRun(run);
    setBestRun(loadBestMathWizRun());
    setScreen("game-over");
  }, [state]);

  const startRun = useCallback(() => {
    setState(createInitialMathWizState(settings));
    setScreen("playing");
  }, [settings]);

  const goToMenu = useCallback(() => {
    setScreen("menu");
  }, []);

  const setActiveSide = useCallback((side: EquationSide) => {
    setState((current) => setSelection(current, { side }));
  }, []);

  const selectStack = useCallback((stackId: string, side: EquationSide) => {
    setState((current) => takeTopFromStack(setSelection(current, { side, stackId }), stackId));
  }, []);

  const useSpell = useCallback((spellType: SpellType) => {
    setState((current) => applySpell(current, spellType));
  }, []);

  const cast = useCallback(() => {
    setState((current) => castEquation(current));
  }, []);

  const resetEquation = useCallback(() => {
    setState((current) => clearEquation(current));
  }, []);

  const returnTokenToStack = useCallback((side: EquationSide, tokenId: string) => {
    setState((current) => returnEquationToken(current, side, tokenId));
  }, []);

  const chooseLevelUpgrade = useCallback((upgrade: Upgrade) => {
    setState((current) => chooseUpgrade(current, upgrade));
  }, []);

  const updateSettingsField = useCallback(<K extends keyof MathWizSettings>(field: K, value: MathWizSettings[K]) => {
    setSettings((current) => ({ ...current, [field]: value }));
  }, []);

  const previewValues = useMemo(() => getPreviewValues(state.equation), [state.equation]);
  const canCast = Boolean(state.equation.left.length && state.equation.right.length && !state.pendingUpgrades.length);
  const stacks = [...state.numberStacks, ...state.operatorStacks];
  const spellDefinitions = getSpellDefinitions();

  return {
    screen,
    settings,
    state,
    stacks,
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
  };
}
