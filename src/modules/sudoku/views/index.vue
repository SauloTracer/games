<template>
    <container>
        <Title>Sudoku</Title>
        <div
            id="board"
            class="grid"
            tabindex="0"
            @keyup.stop="handleKeyUp($event)"
            @keyup.escape="esc()"
        >
            <template v-for="row in [1, 2, 3]">
                <template v-for="col in [1, 2, 3]">
                    <div class="block">
                        <template v-for="line, lineIndex in board.slice((row - 1) * 3, row * 3)">
                            <template
                                v-for="cell, colIndex in line.slice((col - 1) * 3, col * 3)"
                                :key="`${lineIndex + (row - 1) * 3}-${colIndex + (col - 1) * 3}`"
                            >
                                <div
                                    class="cell"
                                    @click="selectedCell = cell"
                                >
                                    <cell
                                        :type="cell.type"
                                        :candidates="cell.candidates"
                                        :value="cell.value"
                                        :selected="cell.selected"
                                        :highlight="highlightedCells.includes(cell)"
                                        :highlightValue="highlightValue"
                                        @click="selectCell(cell.coordinates.row, cell.coordinates.col)"
                                        @updateCandidates="cell.candidates = $event"
                                    ></cell>
                                </div>
                            </template>
                        </template>
                    </div>
                </template>
            </template>
        </div>
        <div style="display: flex; justify-content: center; align-items: center;">
            <button @click="showSolution()">Solve</button>
            <button @click="reset()">Reset</button>
            <button @click="autoCandidate()">Auto Candidate</button>
            <button @click="promoteSingles()">Promote Singles</button>
        </div>
    </container>
</template>

<script setup lang='ts'>
export interface Cell {
    value: number | null;
    type: 'given' | 'filled' | 'candidate';
    candidates: number[];
    selected: boolean;
    highlight: boolean;
    coordinates: { row: number, col: number };
}

import { ref, onBeforeMount, onMounted } from 'vue'

import { useSudokuStore } from '@/modules/sudoku/stores/SudokuStore';

import Title from '@/components/Title.vue';
import cell from '../components/cell.vue';

const sudokuStore = useSudokuStore();

const defaultCell = { selected: false, highlight: false, value: null, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9], type: "candidate", coordinates: { row: 0, col: 0 } } as Cell;
const board = ref<Cell[][]>([
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,],
    [defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell, defaultCell,]
]);
const selectedCell = ref<Cell | null>(null);
const highlightedCells = ref<Cell[]>([]);
const highlightValue = ref<number | null>(null);
let solution: number[][] = [[]];

onBeforeMount(() => {
    reset();
    autoCandidate();
    solution = board.value.map(line => line.map(cell => cell.value ?? 0)) as number[][];
    solve();
});

function reset() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row => {
            board.value[row][col] = {
                ...defaultCell,
                value: sudokuStore.board[row][col],
                coordinates: { row, col },
                candidates: [],
            };
            if (sudokuStore.board[row][col]) {
                board.value[row][col].type = 'given';
                board.value[row][col].value = sudokuStore.board[row][col];
            }
        })
    );
    highlightedCells.value = [];
    highlightValue.value = null;
    selectedCell.value = null;
}

function getBlock(row: number, col: number) {
    row = Math.floor(row / 3);
    col = Math.floor(col / 3);
    return board.value.slice(row * 3, row * 3 + 3).map(line => line.slice(col * 3, col * 3 + 3));
}

function getBlockValues(row: number, col: number) {
    return getBlock(row, col).flat().map(cell => cell.value);
}

function getCellCandidates(row: number, col: number) {
    const possibleCandidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const block = getBlockValues(row, col);
    const boardRow = board.value[row].map(cell => cell.value);
    const boardCol = board.value.map(line => line[col].value);
    const candidates = possibleCandidates.filter(candidate => {
        return ![...boardCol, ...boardRow, ...block].includes(candidate);
    });
    return candidates;
}

function autoCandidate() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
            board.value[row][col].candidates = getCellCandidates(row, col)
        )
    );
}

function removeCandidateFromConnectedCells(value: number, row: number, col: number) {
    const block = getBlock(row, col).flat();
    const boardRow = board.value[row];
    const boardColumn = board.value.map(line => line[col]);
    [boardRow, boardColumn, block].flat().map(cell => {
        if (cell.type == 'candidate') {
            cell.candidates = cell.candidates.filter(candidate => candidate != value);
        }
    });
}

function highlightConnectedCells(row: number, col: number) {
    highlightedCells.value = [];
    const block = getBlock(row, col).flat();
    const boardRow = board.value[row];
    const boardColumn = board.value.map(line => line[col]);
    highlightedCells.value = [...block, ...boardRow, ...boardColumn];
}

function selectCell(row: number, col: number) {
    console.log("row", row, "col", col, board.value[row][col])
    highlightValue.value = board.value[row][col].value;
    selectedCell.value = board.value[row][col];
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => {
            board.value[row][col].selected = false;
            board.value[row][col].highlight = false;
        })
    );
    board.value[row][col].selected = true;
    highlightConnectedCells(row, col);
    console.log(board.value[row][col], selectedCell.value);
}

function promoteSingles() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => {
            const cell = board.value[row][col];
            if (cell.type == 'candidate' && cell.candidates.length == 1) {
                const value = cell.candidates[0];
                cell.value = value;
                cell.type = 'filled';
                removeCandidateFromConnectedCells(value, row, col);
            }
        })
    );
}

function handleKeyUp(event: KeyboardEvent) {
    console.log(event.key, selectedCell.value, selectedCell.value?.coordinates);
    if (!selectedCell.value) return;

    let row = selectedCell.value.coordinates.row;
    let col = selectedCell.value.coordinates.col;

    if (event.key == 'ArrowUp') {
        row = row > 0 ? row - 1 : 8;
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowDown') {
        row = row < 8 ? row + 1 : 0;
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowLeft') {
        col = col > 0 ? col - 1 : 8;
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowRight') {
        col = col < 8 ? col + 1 : 0;
        selectCell(row, col);
        return;
    }

    if (selectedCell.value.type != 'given') {
        if (!["1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete"].includes(event.key)) return;

        if (["Backspace", "Delete"].includes(event.key)) {
            board.value[row][col].value = null;
            board.value[row][col].type = 'candidate';
            board.value[row][col].candidates = getCellCandidates(row, col);
            highlightValue.value = null;
        } else {
            board.value[row][col].value = parseInt(event.key);
            board.value[row][col].type = 'filled';
            highlightValue.value = parseInt(event.key);
            removeCandidateFromConnectedCells(parseInt(event.key), row, col);
        }
    }
}

function esc() {
    selectedCell.value = null;
    highlightValue.value = null;
    highlightedCells.value = [];
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
            board.value[row][col].selected = false
        )
    );
}

function possible(row: number, col: number, k: number) {
    for (let i = 0; i < 9; i++) {
        const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        const n = 3 * Math.floor(col / 3) + i % 3;
        if (solution[row][i] == k || solution[i][col] == k || solution[m][n] == k) {
            return false;
        }
    }
    return true;
}


function solve() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (!solution[i][j]) {
                for (let k = 1; k <= 9; k++) {
                    if (possible(i, j, k)) {
                        solution[i][j] = k;
                        if (solve()) {
                            return true;
                        } else {
                            solution[i][j] = 0;
                        }
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function showSolution() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => {
            if (board.value[row][col].type != 'given') {
                board.value[row][col].value = solution[row][col];
                board.value[row][col].type = 'filled';
            }
        })
    );
}

</script>

<style lang="css" scoped>
#board {
    height: 80vh;
    aspect-ratio: 1 / 1;
    margin: 0 auto;
    border: solid 3px black;
}

.grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: center;
}

.block {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: center;
    width: 33.33%;
    height: 33.34%;
    border: solid 2px gray;
    margin: -2px;
    z-index: 100;
}

.cell {
    display: inline-block;
    width: 33.33%;
    height: 33.33%;
    border: solid 1px gray;
    margin: -1px;
    z-index: 99;
}
</style>