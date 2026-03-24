export type Operator = "+" | "-" | "*" | "/" | "%" | "^" | "!" | "!!" | "sqrt";

export type NumberToken = {
  id: string;
  kind: "number";
  value: number;
  sign: 1 | -1;
  originStackId: string;
};

export type OperatorToken = {
  id: string;
  kind: "operator";
  op: Operator;
  originStackId: string;
};

export type Token = NumberToken | OperatorToken;

export type StackType = "number" | "operator";

export type StackState = {
  id: string;
  type: StackType;
  items: Token[];
  maxHeight: number;
  frozenTurns: number;
};

export type EquationSide = "left" | "right";

export type EquationState = {
  left: Token[];
  right: Token[];
};

export type SpellType = "flip" | "clearTop" | "freeze";

export type SpellDefinition = {
  type: SpellType;
  manaCost: number;
};

export type Upgrade =
  | { type: "addNumberStack" }
  | { type: "addOperatorStack" }
  | { type: "unlockOperator"; operator: Operator };

export type HealthState = {
  hp: number;
  maxHp: number;
};

export type ManaState = {
  mana: number;
  maxMana: number;
};

export type MathWizScreen = "menu" | "playing" | "game-over";

export type MathWizSettings = {
  animationsEnabled: boolean;
  showResultPreview: boolean;
};

export type FeedbackTone = "idle" | "success" | "error" | "warning";

export type MathWizStatus = {
  titleKey: string;
  detailKey?: string;
  detailText?: string;
  detailValues?: Record<string, string | number>;
  tone: FeedbackTone;
};

export type MathWizRun = {
  level: number;
  stableSpells: number;
  failedSpells: number;
  highestCombo: number;
  finalHp: number;
};

export type CastEvaluation =
  | {
      ok: true;
      leftValue: number;
      rightValue: number;
      leftTrace: string;
      rightTrace: string;
    }
  | {
      ok: false;
      reason: "invalid_expression" | "not_equal";
      messageKey: string;
      wizardMessageKey?: string;
      leftValue?: number;
      rightValue?: number;
      leftTrace?: string;
      rightTrace?: string;
      damage: number;
    };

export type SelectionState = {
  stackId: string | null;
  side: EquationSide;
};

export type MathWizState = {
  level: number;
  stableSpells: number;
  failedSpells: number;
  comboCount: number;
  comboMultiplier: number;
  turn: number;
  turnElapsedMs: number;
  health: HealthState;
  mana: ManaState;
  numberStacks: StackState[];
  operatorStacks: StackState[];
  equation: EquationState;
  unlockedOperators: Operator[];
  selected: SelectionState;
  status: MathWizStatus;
  lastCast: CastEvaluation | null;
  pendingUpgrades: Upgrade[];
  gameOver: boolean;
};
