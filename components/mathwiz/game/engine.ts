import type {
  CastEvaluation,
  EquationState,
  MathWizSettings,
  MathWizState,
  NumberToken,
  Operator,
  OperatorToken,
  SelectionState,
  SpellDefinition,
  SpellType,
  StackState,
  Token,
  Upgrade,
} from "@/components/mathwiz/game/types";

const MAX_STACK_HEIGHT = 10;
const INITIAL_HP = 8;
const INITIAL_MANA = 3;
const MAX_MANA = 6;
const STACK_FEED_INTERVAL_MS = 10000;
const TURN_TIMEOUT_MS = 22000;
const LEVEL_INTERVAL = 3;
const OPERATOR_UNLOCK_ORDER: Operator[] = ["+", "-", "*", "/", "%", "sqrt", "^", "!", "!!"];
const SPELLS: SpellDefinition[] = [
  { type: "flip", manaCost: 1 },
  { type: "clearTop", manaCost: 2 },
  { type: "freeze", manaCost: 3 },
];

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export function getSpellDefinitions() {
  return SPELLS;
}

function createNumberToken(originStackId: string): NumberToken {
  return {
    id: randomId(),
    kind: "number",
    value: 1 + Math.floor(Math.random() * 9),
    sign: Math.random() > 0.5 ? 1 : -1,
    originStackId,
  };
}

function weightedOperator(unlockedOperators: Operator[]) {
  const weights = unlockedOperators.flatMap((operator) => {
    if (operator === "+" || operator === "-") {
      return [operator, operator, operator];
    }
    if (operator === "*" || operator === "/" || operator === "%") {
      return [operator, operator];
    }
    return [operator];
  });
  return weights[Math.floor(Math.random() * weights.length)] ?? "+";
}

function createOperatorToken(unlockedOperators: Operator[], originStackId: string): OperatorToken {
  return {
    id: randomId(),
    kind: "operator",
    op: weightedOperator(unlockedOperators),
    originStackId,
  };
}

function createStack(type: StackState["type"], unlockedOperators: Operator[], items = 2): StackState {
  const stackId = randomId();
  return {
    id: stackId,
    type,
    maxHeight: MAX_STACK_HEIGHT,
    frozenTurns: 0,
    items: Array.from({ length: items }, () => (type === "number" ? createNumberToken(stackId) : createOperatorToken(unlockedOperators, stackId))),
  };
}

function tokenHasOperator(tokens: Token[]) {
  return tokens.some((token) => token.kind === "operator");
}

function tokenToLabel(token: Token) {
  if (token.kind === "number") {
    const signed = token.value * token.sign;
    return signed >= 0 ? `+${signed}` : String(signed);
  }
  return token.op;
}

type EvalSuccess = {
  ok: true;
  value: number;
  nextIndex: number;
};

type EvalFailure = {
  ok: false;
  messageKey: string;
  wizardMessageKey?: string;
};

type EvalResult = EvalSuccess | EvalFailure;
type EvalValueResult = EvalFailure | { ok: true; value: number };

function asFailure(messageKey: string, wizardMessageKey?: string): EvalFailure {
  return { ok: false, messageKey, wizardMessageKey };
}

function applyFactorial(value: number): EvalValueResult {
  if (!Number.isInteger(value) || value < 0 || value > 5) {
    return asFailure("mathwiz.messages.invalidFactorial");
  }
  let result = 1;
  for (let current = 2; current <= value; current += 1) {
    result *= current;
  }
  return { ok: true, value: result };
}

function applyDoubleFactorial(value: number): EvalValueResult {
  if (!Number.isInteger(value) || value < 0 || value > 5) {
    return asFailure("mathwiz.messages.invalidDoubleFactorial");
  }
  let result = 1;
  for (let current = value; current > 1; current -= 2) {
    result *= current;
  }
  return { ok: true, value: result };
}

function parseExpression(tokens: Token[]) {
  const parsePrimary = (index: number): EvalResult => {
    const token = tokens[index];
    if (!token) {
      return asFailure("mathwiz.messages.incompleteSpell");
    }
    if (token.kind === "number") {
      return { ok: true, value: token.value * token.sign, nextIndex: index + 1 };
    }
    if (token.op === "sqrt") {
      const next = parsePrimary(index + 1);
      if (!next.ok) {
        return next;
      }
      if (next.value < 0 || !Number.isInteger(Math.sqrt(next.value))) {
        return asFailure("mathwiz.messages.wholeMagicRequired", "mathwiz.messages.noFractions");
      }
      return { ok: true, value: Math.sqrt(next.value), nextIndex: next.nextIndex };
    }
    return asFailure("mathwiz.messages.invalidStructure");
  };

  const parsePostfix = (index: number): EvalResult => {
    let current = parsePrimary(index);
    if (!current.ok) {
      return current;
    }

    while (true) {
      const token: Token | undefined = tokens[current.nextIndex];
      if (!token || token.kind !== "operator" || (token.op !== "!" && token.op !== "!!")) {
        break;
      }

      const result: EvalValueResult = token.op === "!" ? applyFactorial(current.value) : applyDoubleFactorial(current.value);
      if (!result.ok) {
        return result;
      }
      current = { ok: true, value: result.value, nextIndex: current.nextIndex + 1 };
    }

    return current;
  };

  const parsePower = (index: number): EvalResult => {
    const left = parsePostfix(index);
    if (!left.ok) {
      return left;
    }

    const token = tokens[left.nextIndex];
    if (!token || token.kind !== "operator" || token.op !== "^") {
      return left;
    }

    const right = parsePower(left.nextIndex + 1);
    if (!right.ok) {
      return right;
    }
    if (!Number.isInteger(right.value) || right.value < 0) {
      return asFailure("mathwiz.messages.wholePowersOnly");
    }
    const value = left.value ** right.value;
    if (!Number.isInteger(value)) {
      return asFailure("mathwiz.messages.wholePowersOnly");
    }
    return { ok: true, value, nextIndex: right.nextIndex };
  };

  const parseMulDivMod = (index: number): EvalResult => {
    let current = parsePower(index);
    if (!current.ok) {
      return current;
    }

    while (true) {
      const operator: Token | undefined = tokens[current.nextIndex];
      if (!operator || operator.kind !== "operator" || !["*", "/", "%"].includes(operator.op)) {
        break;
      }
      const right = parsePower(current.nextIndex + 1);
      if (!right.ok) {
        return right;
      }

      if (operator.op === "*") {
        current = { ok: true, value: current.value * right.value, nextIndex: right.nextIndex };
        continue;
      }

      if (right.value === 0) {
        return asFailure("mathwiz.messages.zeroCollapse", "mathwiz.messages.wholeMagicRequired");
      }

      if (operator.op === "/") {
        if (current.value % right.value !== 0) {
          return asFailure("mathwiz.messages.invalidDivision", "mathwiz.messages.invalidDivisionWizard");
        }
        current = { ok: true, value: current.value / right.value, nextIndex: right.nextIndex };
        continue;
      }

      current = { ok: true, value: current.value % right.value, nextIndex: right.nextIndex };
    }

    return current;
  };

  const parseAddSub = (index: number): EvalResult => {
    let current = parseMulDivMod(index);
    if (!current.ok) {
      return current;
    }

    while (true) {
      const operator: Token | undefined = tokens[current.nextIndex];
      if (!operator || operator.kind !== "operator" || (operator.op !== "+" && operator.op !== "-")) {
        break;
      }

      const right = parseMulDivMod(current.nextIndex + 1);
      if (!right.ok) {
        return right;
      }

      current = {
        ok: true,
        value: operator.op === "+" ? current.value + right.value : current.value - right.value,
        nextIndex: right.nextIndex,
      };
    }

    return current;
  };

  const result = parseAddSub(0);
  if (!result.ok) {
    return result;
  }
  if (result.nextIndex !== tokens.length) {
    return asFailure("mathwiz.messages.invalidStructure");
  }
  return result;
}

function evaluateSide(tokens: Token[]) {
  const result = parseExpression(tokens);
  if (!result.ok) {
    return result;
  }
  if (!Number.isInteger(result.value)) {
    return asFailure("mathwiz.messages.noFractions");
  }
  return {
    ok: true,
    value: result.value,
    trace: tokens.map(tokenToLabel).join(" "),
  } as const;
}

export function evaluateEquation(equation: EquationState): CastEvaluation {
  if (!equation.left.length || !equation.right.length) {
    return {
      ok: false,
      reason: "invalid_expression",
      messageKey: "mathwiz.messages.bothSidesNeeded",
      damage: 1,
    };
  }

  if (!tokenHasOperator(equation.left) && !tokenHasOperator(equation.right)) {
    return {
      ok: false,
      reason: "invalid_expression",
      messageKey: "mathwiz.messages.operatorRequired",
      damage: 1,
    };
  }

  const left = evaluateSide(equation.left);
  if (!left.ok) {
    return {
      ok: false,
      reason: "invalid_expression",
      messageKey: left.messageKey,
      wizardMessageKey: left.wizardMessageKey,
      damage: 1,
    };
  }

  const right = evaluateSide(equation.right);
  if (!right.ok) {
    return {
      ok: false,
      reason: "invalid_expression",
      messageKey: right.messageKey,
      wizardMessageKey: right.wizardMessageKey,
      damage: 1,
      leftValue: left.value,
      leftTrace: left.trace,
    };
  }

  if (left.value !== right.value) {
    return {
      ok: false,
      reason: "not_equal",
      messageKey: "mathwiz.messages.spellFailed",
      damage: Math.min(3, Math.max(1, Math.abs(left.value - right.value))),
      leftValue: left.value,
      rightValue: right.value,
      leftTrace: left.trace,
      rightTrace: right.trace,
    };
  }

  return {
    ok: true,
    leftValue: left.value,
    rightValue: right.value,
    leftTrace: left.trace,
    rightTrace: right.trace,
  };
}

function createStatus(
  titleKey: string,
  options: { detailKey?: string; detailText?: string; detailValues?: Record<string, string | number> } = {},
  tone: MathWizState["status"]["tone"],
) {
  return { titleKey, tone, ...options } as MathWizState["status"];
}

export function createInitialMathWizState(_settings: MathWizSettings): MathWizState {
  const unlockedOperators: Operator[] = ["+", "-"];
  return {
    level: 1,
    stableSpells: 0,
    failedSpells: 0,
    comboCount: 0,
    comboMultiplier: 1,
    turn: 1,
    turnElapsedMs: 0,
    health: { hp: INITIAL_HP, maxHp: INITIAL_HP },
    mana: { mana: INITIAL_MANA, maxMana: MAX_MANA },
    numberStacks: [createStack("number", unlockedOperators), createStack("number", unlockedOperators), createStack("number", unlockedOperators)],
    operatorStacks: [createStack("operator", unlockedOperators), createStack("operator", unlockedOperators)],
    equation: { left: [], right: [] },
    unlockedOperators,
    selected: { stackId: null, side: "left" },
    status: createStatus("mathwiz.status.idleTitle", { detailKey: "mathwiz.status.idleDetail" }, "idle"),
    lastCast: null,
    pendingUpgrades: [],
    gameOver: false,
  };
}

function spawnOnStack(stack: StackState, unlockedOperators: Operator[]) {
  if (stack.frozenTurns > 0) {
    return {
      ...stack,
      frozenTurns: stack.frozenTurns - 1,
    };
  }

  return {
    ...stack,
    items: [...stack.items, stack.type === "number" ? createNumberToken(stack.id) : createOperatorToken(unlockedOperators, stack.id)],
  };
}

function addTokenBackToStacks(stacks: StackState[], token: Token) {
  return stacks.map((stack) => {
    if (stack.id !== token.originStackId) {
      return stack;
    }

    return {
      ...stack,
      items: [...stack.items, token],
    };
  });
}

function clearBuilderOnly(state: MathWizState) {
  return {
    ...state,
    equation: { left: [], right: [] },
  };
}

function stackOverflowed(stacks: StackState[]) {
  return stacks.some((stack) => stack.items.length > stack.maxHeight);
}

function nextComboMultiplier(comboCount: number) {
  return 1 + comboCount * 0.5;
}

export function setSelection(state: MathWizState, patch: Partial<SelectionState>) {
  return {
    ...state,
    selected: {
      ...state.selected,
      ...patch,
    },
  };
}

export function takeTopFromStack(state: MathWizState, stackId: string) {
  const updateStacks = (stacks: StackState[]) =>
    stacks.map((stack) => {
      if (stack.id !== stackId || !stack.items.length) {
        return stack;
      }
      return {
        ...stack,
        items: stack.items.slice(0, -1),
      };
    });

  const sourceStack = [...state.numberStacks, ...state.operatorStacks].find((stack) => stack.id === stackId);
  const token = sourceStack?.items[sourceStack.items.length - 1];
  if (!token) {
    return state;
  }

  return {
    ...state,
    numberStacks: updateStacks(state.numberStacks),
    operatorStacks: updateStacks(state.operatorStacks),
    equation: {
      ...state.equation,
      [state.selected.side]: [...state.equation[state.selected.side], token],
    },
    selected: { ...state.selected, stackId },
  };
}

export function removeLastToken(state: MathWizState, side: "left" | "right") {
  return {
    ...state,
    equation: {
      ...state.equation,
      [side]: state.equation[side].slice(0, -1),
    },
  };
}

export function clearEquation(state: MathWizState) {
  const equationTokens = [...state.equation.left, ...state.equation.right];
  const numberTokens = equationTokens.filter((token): token is NumberToken => token.kind === "number");
  const operatorTokens = equationTokens.filter((token): token is OperatorToken => token.kind === "operator");

  return {
    ...state,
    numberStacks: numberTokens.reduce((stacks, token) => addTokenBackToStacks(stacks, token), state.numberStacks),
    operatorStacks: operatorTokens.reduce((stacks, token) => addTokenBackToStacks(stacks, token), state.operatorStacks),
    equation: { left: [], right: [] },
  };
}

export function returnEquationToken(state: MathWizState, side: "left" | "right", tokenId: string) {
  const token = state.equation[side].find((entry) => entry.id === tokenId);
  if (!token) {
    return state;
  }

  const nextEquation = state.equation[side].filter((entry) => entry.id !== tokenId);
  return {
    ...state,
    numberStacks: token.kind === "number" ? addTokenBackToStacks(state.numberStacks, token) : state.numberStacks,
    operatorStacks: token.kind === "operator" ? addTokenBackToStacks(state.operatorStacks, token) : state.operatorStacks,
    equation: {
      ...state.equation,
      [side]: nextEquation,
    },
  };
}

export function applySpell(state: MathWizState, spellType: SpellType) {
  const spell = SPELLS.find((entry) => entry.type === spellType);
  if (!spell || state.mana.mana < spell.manaCost || !state.selected.stackId) {
    return state;
  }

  const updateStack = (stack: StackState) => {
    if (stack.id !== state.selected.stackId) {
      return stack;
    }

    if (!stack.items.length) {
      return stack;
    }

    const top = stack.items[stack.items.length - 1];
    if (spellType === "flip" && top.kind === "number") {
      return {
        ...stack,
        items: [...stack.items.slice(0, -1), { ...top, sign: (top.sign * -1) as 1 | -1 }],
      };
    }

    if (spellType === "clearTop") {
      return {
        ...stack,
        items: stack.items.slice(0, -1),
      };
    }

    if (spellType === "freeze") {
      return {
        ...stack,
        frozenTurns: stack.frozenTurns + 1,
      };
    }

    return stack;
  };

  return {
    ...state,
    mana: {
      ...state.mana,
      mana: state.mana.mana - spell.manaCost,
    },
    numberStacks: state.numberStacks.map(updateStack),
    operatorStacks: state.operatorStacks.map(updateStack),
    status: createStatus("mathwiz.status.readyTitle", { detailKey: "mathwiz.status.readyDetail" }, "warning"),
  };
}

function getUnlockUpgrade(unlockedOperators: Operator[]) {
  const nextOperator = OPERATOR_UNLOCK_ORDER.find((operator) => !unlockedOperators.includes(operator));
  return nextOperator ? ({ type: "unlockOperator", operator: nextOperator } satisfies Upgrade) : null;
}

function uniqueUpgrades(upgrades: Upgrade[]) {
  const seen = new Set<string>();
  return upgrades.filter((upgrade) => {
    const key = upgrade.type === "unlockOperator" ? `${upgrade.type}-${upgrade.operator}` : upgrade.type;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function createUpgradeChoices(state: MathWizState) {
  const base: Upgrade[] = [{ type: "addNumberStack" }, { type: "addOperatorStack" }];
  const unlock = getUnlockUpgrade(state.unlockedOperators);
  if (unlock) {
    base.push(unlock);
  }
  return uniqueUpgrades(base).slice(0, 3);
}

export function castEquation(state: MathWizState) {
  const evaluation = evaluateEquation(state.equation);

  if (!evaluation.ok) {
    const nextHp = Math.max(0, state.health.hp - evaluation.damage);
    const gameOver = nextHp <= 0;
    return {
      ...clearBuilderOnly(state),
      failedSpells: state.failedSpells + 1,
      comboCount: 0,
      comboMultiplier: 1,
      turn: state.turn + 1,
      turnElapsedMs: 0,
      health: { ...state.health, hp: nextHp },
      lastCast: evaluation,
      gameOver,
      status: createStatus(
        "mathwiz.status.failedTitle",
        { detailKey: evaluation.wizardMessageKey ?? evaluation.messageKey },
        "error",
      ),
    } satisfies MathWizState;
  }

  const stableSpells = state.stableSpells + 1;
  const comboCount = state.comboCount + 1;
  const comboMultiplier = nextComboMultiplier(comboCount);
  const level = 1 + Math.floor(stableSpells / LEVEL_INTERVAL);
  const pendingUpgrades = level > state.level ? createUpgradeChoices(state) : [];
  const healedHp = Math.min(state.health.maxHp, state.health.hp + 1);
  const manaGain = Math.min(state.mana.maxMana, state.mana.mana + 1);

  return {
    ...clearBuilderOnly(state),
    level,
    stableSpells,
    comboCount,
    comboMultiplier,
    turn: state.turn + 1,
    turnElapsedMs: 0,
    health: { ...state.health, hp: healedHp },
    mana: { ...state.mana, mana: manaGain },
    numberStacks: state.numberStacks,
    operatorStacks: state.operatorStacks,
    pendingUpgrades,
    lastCast: evaluation,
    gameOver: false,
    status: createStatus(
      "mathwiz.status.successTitle",
      { detailText: `${evaluation.leftTrace} = ${evaluation.rightTrace}` },
      "success",
    ),
  } satisfies MathWizState;
}

export function chooseUpgrade(state: MathWizState, upgrade: Upgrade) {
  let nextState = {
    ...state,
    pendingUpgrades: [],
    status: createStatus("mathwiz.status.successTitle", { detailKey: "mathwiz.status.upgradeForged" }, "success"),
  };

  if (upgrade.type === "addNumberStack") {
    nextState = {
      ...nextState,
      numberStacks: [...nextState.numberStacks, createStack("number", nextState.unlockedOperators, 1)],
    };
  } else if (upgrade.type === "addOperatorStack") {
    nextState = {
      ...nextState,
      operatorStacks: [...nextState.operatorStacks, createStack("operator", nextState.unlockedOperators, 1)],
    };
  } else {
    nextState = {
      ...nextState,
      unlockedOperators: [...nextState.unlockedOperators, upgrade.operator],
    };
  }

  return nextState;
}

export function tickTurnTimer(state: MathWizState, deltaMs: number) {
  const nextElapsed = state.turnElapsedMs + deltaMs;
  const previousFeedStep = Math.floor(state.turnElapsedMs / STACK_FEED_INTERVAL_MS);
  const nextFeedStep = Math.floor(nextElapsed / STACK_FEED_INTERVAL_MS);
  const feedCount = Math.max(0, nextFeedStep - previousFeedStep);

  let nextState: MathWizState = {
    ...state,
    turnElapsedMs: nextElapsed,
  };

  if (feedCount > 0) {
    let numberStacks = nextState.numberStacks;
    let operatorStacks = nextState.operatorStacks;

    for (let index = 0; index < feedCount; index += 1) {
      numberStacks = numberStacks.map((stack) => spawnOnStack(stack, nextState.unlockedOperators));
      operatorStacks = operatorStacks.map((stack) => spawnOnStack(stack, nextState.unlockedOperators));
    }

    const gameOver = stackOverflowed(numberStacks) || stackOverflowed(operatorStacks);
    nextState = {
      ...nextState,
      turn: nextState.turn + feedCount,
      numberStacks,
      operatorStacks,
      gameOver,
      status: createStatus("mathwiz.status.unstableTitle", { detailKey: "mathwiz.status.stacksFed" }, "warning"),
    };
  }

  if (nextElapsed >= TURN_TIMEOUT_MS && nextState.comboCount > 0) {
    return {
      ...nextState,
      comboCount: 0,
      comboMultiplier: 1,
      status: createStatus("mathwiz.status.unstableTitle", { detailKey: "mathwiz.status.comboFaded" }, "warning"),
    };
  }

  return nextState;
}

export function getPreviewValues(equation: EquationState) {
  const left = equation.left.length ? evaluateSide(equation.left) : null;
  const right = equation.right.length ? evaluateSide(equation.right) : null;
  return {
    left: left && left.ok ? left.value : null,
    right: right && right.ok ? right.value : null,
  };
}

export function formatToken(token: Token) {
  return tokenToLabel(token);
}
