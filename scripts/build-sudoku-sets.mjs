// Gera lib/sudoku-puzzles/<dificuldade>.json a partir de src/assets/sudoku.json.
// A API carrega só esses arquivos pequenos, para não ler os 24 MB a cada cold start.
// Uso: node scripts/build-sudoku-sets.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_PER_DIFFICULTY = 5000;
const ranges = {
  easy: [0, 3],
  medium: [3.1, 5],
  hard: [5.1, 7],
  expert: [7.1, Number.POSITIVE_INFINITY],
};

const root = process.cwd();
const dataset = JSON.parse(readFileSync(path.join(root, "src/assets/sudoku.json"), "utf8"));
const outDir = path.join(root, "lib/sudoku-puzzles");
mkdirSync(outDir, { recursive: true });

// Amostragem determinística (passo fixo) para o resultado não mudar a cada execução.
for (const [difficulty, [min, max]] of Object.entries(ranges)) {
  const subset = dataset.filter(([, rating]) => rating >= min && rating <= max);
  const step = Math.max(1, subset.length / MAX_PER_DIFFICULTY);
  const sample = [];
  for (let index = 0; index < subset.length && sample.length < MAX_PER_DIFFICULTY; index += step) {
    sample.push(subset[Math.floor(index)]);
  }
  writeFileSync(path.join(outDir, `${difficulty}.json`), JSON.stringify(sample));
  console.log(`${difficulty}: ${sample.length} de ${subset.length}`);
}
