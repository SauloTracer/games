import type { Cell } from "@/lib/types";

type Universe = {
  rows: number[];
  cols: number[];
  blocks: number[];
};

type FilterResult = {
  matchedCells: Map<string, number>;
  candidateHighlights: Map<string, Map<number, number>>;
};

type PatternInstance = {
  cells: Cell[];
  candidates: number[];
};

type ParsedArgs = {
  positional: number[];
  named: Record<string, number[]>;
};

function key(row: number, col: number) {
  return `${row}-${col}`;
}

function getBlockNumber(row: number, col: number) {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3) + 1;
}

function inUniverse(cell: Cell, universe: Universe) {
  const rowMatch = universe.rows.length === 0 || universe.rows.includes(cell.row + 1);
  const colMatch = universe.cols.length === 0 || universe.cols.includes(cell.col + 1);
  const blockMatch = universe.blocks.length === 0 || universe.blocks.includes(getBlockNumber(cell.row, cell.col));
  return rowMatch && colMatch && blockMatch;
}

function parseArgs(raw: string | undefined): ParsedArgs {
  const parsed: ParsedArgs = {
    positional: [],
    named: {},
  };

  if (!raw) {
    return parsed;
  }

  for (const part of raw.split(",")) {
    const token = part.trim();
    if (!token) {
      continue;
    }

    if (token.includes("=")) {
      const [rawName, rawValue] = token.split("=", 2);
      const name = rawName.trim().toLowerCase();
      const values = rawValue
        .split("|")
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter((value) => Number.isFinite(value));
      parsed.named[name] = values;
      continue;
    }

    const value = Number.parseInt(token, 10);
    if (Number.isFinite(value)) {
      parsed.positional.push(value);
    }
  }

  return parsed;
}

function normalizeCommandName(raw: string) {
  return raw.toLowerCase().replace(/[_-]/g, "");
}

function getNumericArgs(args: ParsedArgs, ...names: string[]) {
  for (const name of names) {
    const found = args.named[name.toLowerCase()];
    if (found && found.length > 0) {
      return found;
    }
  }
  return args.positional;
}

function getSingleNumericArg(args: ParsedArgs, ...names: string[]) {
  const values = getNumericArgs(args, ...names);
  return values.length > 0 ? values[0] : null;
}

function matchesCandidateFilter(args: ParsedArgs, candidates: number[]) {
  const wanted = getNumericArgs(args, "candidate", "candidates", "digit", "value", "values");
  return wanted.length === 0 || wanted.some((candidate) => candidates.includes(candidate));
}

function matchesExactCandidateGroup(args: ParsedArgs, candidates: number[]) {
  const wanted = getNumericArgs(args, "pair", "candidates", "candidate", "values");
  if (wanted.length === 0) {
    return true;
  }
  return wanted.length === candidates.length && wanted.every((candidate) => candidates.includes(candidate));
}

function getUnitCells(board: Cell[][], type: "row" | "col" | "block", index: number) {
  if (type === "row") {
    return board[index];
  }

  if (type === "col") {
    return board.map((row) => row[index]);
  }

  const rowStart = Math.floor(index / 3) * 3;
  const colStart = (index % 3) * 3;
  const cells: Cell[] = [];
  for (let row = rowStart; row < rowStart + 3; row += 1) {
    for (let col = colStart; col < colStart + 3; col += 1) {
      cells.push(board[row][col]);
    }
  }
  return cells;
}

function addPattern(result: FilterResult, pattern: PatternInstance, groupIndex: number) {
  for (const cell of pattern.cells) {
    mergeResult(
      result,
      cell,
      pattern.candidates.filter((candidate) => cell.candidates.includes(candidate)),
      groupIndex,
    );
  }
}

function findUniqueCandidates(board: Cell[][], universe: Universe) {
  const results = new Map<string, Set<number>>();

  const addUnique = (cell: Cell, candidate: number) => {
    const cellKey = key(cell.row, cell.col);
    if (!results.has(cellKey)) {
      results.set(cellKey, new Set<number>());
    }
    results.get(cellKey)?.add(candidate);
  };

  const inspectUnit = (cells: Cell[]) => {
    for (let candidate = 1; candidate <= 9; candidate += 1) {
      const holders = cells.filter((cell) => !cell.value && cell.candidates.includes(candidate));
      if (holders.length === 1) {
        addUnique(holders[0], candidate);
      }
    }
  };

  for (let row = 0; row < 9; row += 1) {
    if (universe.rows.length === 0 || universe.rows.includes(row + 1)) {
      inspectUnit(getUnitCells(board, "row", row));
    }
  }

  for (let col = 0; col < 9; col += 1) {
    if (universe.cols.length === 0 || universe.cols.includes(col + 1)) {
      inspectUnit(getUnitCells(board, "col", col));
    }
  }

  for (let block = 0; block < 9; block += 1) {
    if (universe.blocks.length === 0 || universe.blocks.includes(block + 1)) {
      inspectUnit(getUnitCells(board, "block", block));
    }
  }

  return results;
}

function findHiddenPairs(board: Cell[][], universe: Universe) {
  const patterns: PatternInstance[] = [];
  const added = new Set<string>();

  const inspectUnit = (cells: Cell[]) => {
    const candidatesCells = cells.filter((cell) => !cell.value && cell.candidates.length > 0);
    if (candidatesCells.length < 2) {
      return;
    }

    for (let cand1 = 1; cand1 <= 9; cand1 += 1) {
      for (let cand2 = cand1 + 1; cand2 <= 9; cand2 += 1) {
        const cellsWithCand1 = candidatesCells.filter((cell) => cell.candidates.includes(cand1));
        const cellsWithCand2 = candidatesCells.filter((cell) => cell.candidates.includes(cand2));
        if (cellsWithCand1.length !== 2 || cellsWithCand2.length !== 2) {
          continue;
        }

        const sameCells =
          cellsWithCand1.every((cell) => cellsWithCand2.includes(cell)) &&
          cellsWithCand2.every((cell) => cellsWithCand1.includes(cell));
        if (!sameCells) {
          continue;
        }

        const sortedCells = [...cellsWithCand1].sort((left, right) =>
          left.row === right.row ? left.col - right.col : left.row - right.row,
        );
        const patternKey = `${sortedCells[0].row}-${sortedCells[0].col}-${sortedCells[1].row}-${sortedCells[1].col}-${cand1}-${cand2}`;
        if (added.has(patternKey)) {
          continue;
        }

        patterns.push({ cells: sortedCells, candidates: [cand1, cand2] });
        added.add(patternKey);
      }
    }
  };

  for (let row = 0; row < 9; row += 1) {
    if (universe.rows.length === 0 || universe.rows.includes(row + 1)) {
      inspectUnit(getUnitCells(board, "row", row));
    }
  }

  for (let col = 0; col < 9; col += 1) {
    if (universe.cols.length === 0 || universe.cols.includes(col + 1)) {
      inspectUnit(getUnitCells(board, "col", col));
    }
  }

  for (let block = 0; block < 9; block += 1) {
    if (universe.blocks.length === 0 || universe.blocks.includes(block + 1)) {
      inspectUnit(getUnitCells(board, "block", block));
    }
  }

  return patterns;
}

function findXWing(board: Cell[][], universe: Universe) {
  const grouped = new Map<number, Cell[]>();
  const byRow: Record<number, Record<number, number[]>> = {};
  const byCol: Record<number, Record<number, number[]>> = {};

  for (let row = 0; row < 9; row += 1) {
    if (universe.rows.length !== 0 && !universe.rows.includes(row + 1)) {
      continue;
    }
    for (let col = 0; col < 9; col += 1) {
      const cell = board[row][col];
      if (cell.value || cell.candidates.length === 0) {
        continue;
      }
      for (const candidate of cell.candidates) {
        byRow[row] ??= {};
        byRow[row][candidate] ??= [];
        byRow[row][candidate].push(col);
      }
    }
  }

  for (let col = 0; col < 9; col += 1) {
    if (universe.cols.length !== 0 && !universe.cols.includes(col + 1)) {
      continue;
    }
    for (let row = 0; row < 9; row += 1) {
      const cell = board[row][col];
      if (cell.value || cell.candidates.length === 0) {
        continue;
      }
      for (const candidate of cell.candidates) {
        byCol[col] ??= {};
        byCol[col][candidate] ??= [];
        byCol[col][candidate].push(row);
      }
    }
  }

  for (const [row1Text, candidates] of Object.entries(byRow)) {
    for (const [candidateText, cols1] of Object.entries(candidates)) {
      if (cols1.length !== 2) {
        continue;
      }
      for (const [row2Text, row2Candidates] of Object.entries(byRow)) {
        if (Number(row2Text) <= Number(row1Text)) {
          continue;
        }
        const cols2 = row2Candidates[Number(candidateText)];
        if (!cols2 || cols2.length !== 2 || cols1[0] !== cols2[0] || cols1[1] !== cols2[1]) {
          continue;
        }

        const candidate = Number(candidateText);
        const cells = [
          board[Number(row1Text)][cols1[0]],
          board[Number(row1Text)][cols1[1]],
          board[Number(row2Text)][cols1[0]],
          board[Number(row2Text)][cols1[1]],
        ];
        grouped.set(candidate, [...(grouped.get(candidate) ?? []), ...cells]);
      }
    }
  }

  for (const [col1Text, candidates] of Object.entries(byCol)) {
    for (const [candidateText, rows1] of Object.entries(candidates)) {
      if (rows1.length !== 2) {
        continue;
      }
      for (const [col2Text, col2Candidates] of Object.entries(byCol)) {
        if (Number(col2Text) <= Number(col1Text)) {
          continue;
        }
        const rows2 = col2Candidates[Number(candidateText)];
        if (!rows2 || rows2.length !== 2 || rows1[0] !== rows2[0] || rows1[1] !== rows2[1]) {
          continue;
        }

        const candidate = Number(candidateText);
        const cells = [
          board[rows1[0]][Number(col1Text)],
          board[rows1[1]][Number(col1Text)],
          board[rows1[0]][Number(col2Text)],
          board[rows1[1]][Number(col2Text)],
        ];
        grouped.set(candidate, [...(grouped.get(candidate) ?? []), ...cells]);
      }
    }
  }

  for (const [candidate, cells] of grouped.entries()) {
    const deduped = cells.filter(
      (cell, index, all) =>
        all.findIndex((item) => item.row === cell.row && item.col === cell.col) === index,
    );
    grouped.set(candidate, deduped);
  }

  return grouped;
}

function findSwordfish(board: Cell[][], universe: Universe) {
  const grouped = new Map<number, Cell[]>();

  for (let candidate = 1; candidate <= 9; candidate += 1) {
    const rows: Array<{ rowIndex: number; cols: number[] }> = [];
    const cols: Array<{ colIndex: number; rows: number[] }> = [];

    for (let row = 0; row < 9; row += 1) {
      if (universe.rows.length !== 0 && !universe.rows.includes(row + 1)) {
        continue;
      }
      const matches = board[row]
        .filter((cell) => !cell.value && cell.candidates.includes(candidate))
        .map((cell) => cell.col);
      if (matches.length >= 2 && matches.length <= 3) {
        rows.push({ rowIndex: row, cols: matches });
      }
    }

    for (let col = 0; col < 9; col += 1) {
      if (universe.cols.length !== 0 && !universe.cols.includes(col + 1)) {
        continue;
      }
      const matches = board
        .map((row) => row[col])
        .filter((cell) => !cell.value && cell.candidates.includes(candidate))
        .map((cell) => cell.row);
      if (matches.length >= 2 && matches.length <= 3) {
        cols.push({ colIndex: col, rows: matches });
      }
    }

    if (rows.length >= 3) {
      for (let i = 0; i < rows.length; i += 1) {
        for (let j = i + 1; j < rows.length; j += 1) {
          for (let k = j + 1; k < rows.length; k += 1) {
            const uniqueCols = new Set<number>([...rows[i].cols, ...rows[j].cols, ...rows[k].cols]);
            if (uniqueCols.size !== 3) {
              continue;
            }
            const cells: Cell[] = [];
            for (const rowIndex of [rows[i].rowIndex, rows[j].rowIndex, rows[k].rowIndex]) {
              for (const colIndex of uniqueCols) {
                const cell = board[rowIndex][colIndex];
                if (!cell.value && cell.candidates.includes(candidate)) {
                  cells.push(cell);
                }
              }
            }
            grouped.set(candidate, [...(grouped.get(candidate) ?? []), ...cells]);
          }
        }
      }
    }

    if (cols.length >= 3) {
      for (let i = 0; i < cols.length; i += 1) {
        for (let j = i + 1; j < cols.length; j += 1) {
          for (let k = j + 1; k < cols.length; k += 1) {
            const uniqueRows = new Set<number>([...cols[i].rows, ...cols[j].rows, ...cols[k].rows]);
            if (uniqueRows.size !== 3) {
              continue;
            }
            const cells: Cell[] = [];
            for (const rowIndex of uniqueRows) {
              for (const colIndex of [cols[i].colIndex, cols[j].colIndex, cols[k].colIndex]) {
                const cell = board[rowIndex][colIndex];
                if (!cell.value && cell.candidates.includes(candidate)) {
                  cells.push(cell);
                }
              }
            }
            grouped.set(candidate, [...(grouped.get(candidate) ?? []), ...cells]);
          }
        }
      }
    }
  }

  for (const [candidate, cells] of grouped.entries()) {
    const deduped = cells.filter(
      (cell, index, all) =>
        all.findIndex((item) => item.row === cell.row && item.col === cell.col) === index,
    );
    grouped.set(candidate, deduped);
  }

  return grouped;
}

function mergeResult(result: FilterResult, cell: Cell, candidates: number[] = [], groupIndex: number) {
  const cellKey = key(cell.row, cell.col);
  if (!result.matchedCells.has(cellKey)) {
    result.matchedCells.set(cellKey, groupIndex);
  }

  if (candidates.length === 0) {
    return;
  }

  if (!result.candidateHighlights.has(cellKey)) {
    result.candidateHighlights.set(cellKey, new Map<number, number>());
  }

  const bucket = result.candidateHighlights.get(cellKey);
  candidates.forEach((candidate) => {
    if (!bucket?.has(candidate)) {
      bucket?.set(candidate, groupIndex);
    }
  });
}

export function runBoardFilter(board: Cell[][], rawQuery: string): FilterResult {
  const result: FilterResult = {
    matchedCells: new Map<string, number>(),
    candidateHighlights: new Map<string, Map<number, number>>(),
  };

  const query = rawQuery.trim();
  if (!query) {
    return result;
  }

  const groups = query
    .split(";")
    .map((group) => group.trim())
    .filter(Boolean);

  for (const [groupIndex, group] of groups.entries()) {
    let remaining = group;
    const universe: Universe = { rows: [], cols: [], blocks: [] };

    for (const match of group.matchAll(/\b(lines?|l|columns?|cols?|c|blocks?|b)\s*[\(\[]([^\)\]]*)[\)\]]/gi)) {
      const name = match[1].toLowerCase();
      const values = parseArgs(match[2]).positional;
      if (name.startsWith("l")) {
        universe.rows = values;
      } else if (name.startsWith("c")) {
        universe.cols = values;
      } else {
        universe.blocks = values;
      }
      remaining = remaining.replace(match[0], "").trim();
    }

    const commands = remaining
      .split("&&")
      .map((part) => part.trim())
      .filter(Boolean);

    if (commands.length === 0) {
      continue;
    }

    const parsedCommands = commands
      .map((command) => {
        const digitOnly = command.match(/^\d+$/);
        if (digitOnly) {
          return {
            raw: command,
            kind: "digit" as const,
            name: "digit",
            args: {
              positional: [Number.parseInt(digitOnly[0], 10)],
              named: {},
            } satisfies ParsedArgs,
          };
        }

        const parsed = command.match(/^([a-z:_>*-]+)\s*(?:[\(\[]([^\)\]]*)[\)\]])?$/i);
        if (!parsed) {
          return null;
        }

        return {
          raw: command,
          kind: "command" as const,
          name: normalizeCommandName(parsed[1]),
          args: parseArgs(parsed[2]),
        };
      })
      .filter(Boolean);

    const uniqueCandidates = parsedCommands.some((command) => command?.kind === "command" && command.name === "unique")
      ? findUniqueCandidates(board, universe)
      : new Map<string, Set<number>>();
    const hiddenPairs = parsedCommands.some(
      (command) => command?.kind === "command" && (command.name === "hiddenpairs" || command.name === "hiddenpair" || command.name === "hp"),
    )
      ? findHiddenPairs(board, universe)
      : [];
    const xWings = parsedCommands.some(
      (command) => command?.kind === "command" && (command.name === "xwing" || command.name === "xw"),
    )
      ? findXWing(board, universe)
      : new Map<number, Cell[]>();
    const swordfish = parsedCommands.some(
      (command) => command?.kind === "command" && (command.name === "swordfish" || command.name === "sf" || command.name === "sw"),
    )
      ? findSwordfish(board, universe)
      : new Map<number, Cell[]>();

    for (const row of board) {
      for (const cell of row) {
        if (!inUniverse(cell, universe)) {
          continue;
        }

        let matches = true;
        const highlightedCandidates = new Set<number>();

        for (const command of parsedCommands) {
          if (!command) {
            matches = false;
            break;
          }

          if (command.kind === "digit") {
            const value = command.args.positional[0];
            const cellMatches = cell.value === value || cell.candidates.includes(value);
            if (!cellMatches) {
              matches = false;
              break;
            }
            if (cell.candidates.includes(value)) {
              highlightedCandidates.add(value);
            }
            continue;
          }

          const name = command.name;
          const args = command.args;
          const positionalArgs = args.positional;

          if (name === "contains" || name === "contain" || name === "has" || name === "includes" || name === ":") {
            const values = getNumericArgs(args, "candidate", "candidates", "digit", "value", "values");
            const hits = values.filter((value) => cell.candidates.includes(value));
            const cellMatches = hits.length > 0 || (!!cell.value && values.includes(cell.value));
            if (!cellMatches) {
              matches = false;
              break;
            }
            hits.forEach((value) => highlightedCandidates.add(value));
            continue;
          }

          if (name === "containsall" || name === "hasall" || name === "includesall" || name === ">=") {
            const values = getNumericArgs(args, "candidate", "candidates", "digit", "value", "values");
            const cellMatches = values.every((value) => cell.candidates.includes(value));
            if (!cellMatches) {
              matches = false;
              break;
            }
            values.forEach((value) => highlightedCandidates.add(value));
            continue;
          }

          if (name === "only") {
            const candidateOnly =
              !cell.value &&
              cell.candidates.length === positionalArgs.length &&
              cell.candidates.every((candidate) => positionalArgs.includes(candidate));
            const valueOnly = !!cell.value && positionalArgs.length === 1 && cell.value === positionalArgs[0];
            if (!candidateOnly && !valueOnly) {
              matches = false;
              break;
            }
            cell.candidates.forEach((value) => highlightedCandidates.add(value));
            continue;
          }

          if (name === "count" || name === "counter" || name === "*") {
            const size = getSingleNumericArg(args, "size", "count", "len", "length");
            const cellMatches = !cell.value && size !== null && cell.candidates.length === size;
            if (!cellMatches) {
              matches = false;
              break;
            }
            continue;
          }

          if (name === "unique") {
            const cellKey = key(cell.row, cell.col);
            const matchesUnique = uniqueCandidates.has(cellKey);
            if (!matchesUnique) {
              matches = false;
              break;
            }
            uniqueCandidates.get(cellKey)?.forEach((value) => highlightedCandidates.add(value));
            continue;
          }

          if (name === "hiddenpairs" || name === "hiddenpair" || name === "hp") {
            const pattern = hiddenPairs.find((item) =>
              item.cells.some((patternCell) => patternCell.row === cell.row && patternCell.col === cell.col) &&
              matchesExactCandidateGroup(args, item.candidates),
            );
            if (!pattern) {
              matches = false;
              break;
            }
            pattern.candidates.forEach((value) => highlightedCandidates.add(value));
            continue;
          }

          if (name === "xwing" || name === "xw") {
            const candidates = [...xWings.entries()]
              .filter(([, cells]) => cells.some((patternCell) => patternCell.row === cell.row && patternCell.col === cell.col))
              .map(([candidate]) => candidate);
            const filteredCandidates = matchesCandidateFilter(args, candidates)
              ? candidates.filter((candidate) =>
                  getNumericArgs(args, "candidate", "candidates", "digit", "value", "values").length === 0 ||
                  getNumericArgs(args, "candidate", "candidates", "digit", "value", "values").includes(candidate),
                )
              : [];
            if (filteredCandidates.length === 0) {
              matches = false;
              break;
            }
            filteredCandidates.forEach((value) => highlightedCandidates.add(value));
            continue;
          }

          if (name === "swordfish" || name === "sf" || name === "sw") {
            const candidates = [...swordfish.entries()]
              .filter(([, cells]) => cells.some((patternCell) => patternCell.row === cell.row && patternCell.col === cell.col))
              .map(([candidate]) => candidate);
            const filteredCandidates = matchesCandidateFilter(args, candidates)
              ? candidates.filter((candidate) =>
                  getNumericArgs(args, "candidate", "candidates", "digit", "value", "values").length === 0 ||
                  getNumericArgs(args, "candidate", "candidates", "digit", "value", "values").includes(candidate),
                )
              : [];
            if (filteredCandidates.length === 0) {
              matches = false;
              break;
            }
            filteredCandidates.forEach((value) => highlightedCandidates.add(value));
            continue;
          }

          matches = false;
          break;
        }

        if (matches) {
          mergeResult(result, cell, [...highlightedCandidates], groupIndex);
        }
      }
    }

    for (const command of parsedCommands) {
      if (!command || command.kind !== "command") {
        continue;
      }

      if (command.name === "hiddenpairs" || command.name === "hiddenpair" || command.name === "hp") {
        hiddenPairs
          .filter((pattern) => matchesExactCandidateGroup(command.args, pattern.candidates))
          .forEach((pattern) => addPattern(result, pattern, groupIndex));
      }

      if (command.name === "xwing" || command.name === "xw") {
        const wantedCandidates = getNumericArgs(command.args, "candidate", "candidates", "digit", "value", "values");
        xWings.forEach((cells, candidate) => {
          if (wantedCandidates.length > 0 && !wantedCandidates.includes(candidate)) {
            return;
          }
          cells.forEach((cell) => mergeResult(result, cell, [candidate], groupIndex));
        });
      }

      if (command.name === "swordfish" || command.name === "sf" || command.name === "sw") {
        const wantedCandidates = getNumericArgs(command.args, "candidate", "candidates", "digit", "value", "values");
        swordfish.forEach((cells, candidate) => {
          if (wantedCandidates.length > 0 && !wantedCandidates.includes(candidate)) {
            return;
          }
          cells.forEach((cell) => mergeResult(result, cell, [candidate], groupIndex));
        });
      }
    }
  }

  return result;
}
