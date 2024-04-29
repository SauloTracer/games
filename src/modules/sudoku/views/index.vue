<template>
    <Title>Sudoku</Title>
    <v-row>
        <v-col>

            <div
                id="board"
                class="grid3"
                tabindex="0"
                @keyup.stop="handleKeyUp($event)"
                @keyup.escape="esc()"
            >
                <template v-for="row in [1, 2, 3]">
                    <template v-for="col in [1, 2, 3]">
                        <div class="block grid3">
                            <template v-for="line, lineIndex in board.slice((row - 1) * 3, row * 3)">
                                <template
                                    v-for="cell, colIndex in line.slice((col - 1) * 3, col * 3)"
                                    :key="`${lineIndex + (row - 1) * 3}-${colIndex + (col - 1) * 3}`"
                                >
                                    <div
                                        class="cell"
                                        @click="selectedCell = cell"
                                    >
                                        <Cell
                                            :type="cell.type"
                                            :candidates="cell.candidates"
                                            :value="cell.value"
                                            :selected="cell.selected"
                                            :highlight="highlightedCells.includes(cell)"
                                            :highlightValue="highlightValue"
                                            :check="autoCheckCells || cell.check"
                                            :answer="cell.answer"
                                            @click="selectCell(cell.coordinates.row, cell.coordinates.col)"
                                            @updateCandidates="cell.candidates = $event"
                                        ></Cell>
                                    </div>
                                </template>
                            </template>
                        </div>
                    </template>
                </template>
            </div>
        </v-col>
        <v-col>
            <div id="actions">
                <span
                    style="padding: 0.6em 1.2em;"
                    class="checkbox"
                >
                    <input
                        id="autoCheckCells"
                        type="checkbox"
                        v-model="autoCheckCells"
                        label="Auto Check"
                        @change="updateCheckCells()"
                    />
                    <label
                        for="autoCheckCells"
                        style="font-weight:500;"
                    > Auto Check</label>
                </span>
                <button
                    class="button"
                    @click="autoCandidate()"
                >Auto Candidate</button>
                <br />
                <button
                    class="button"
                    v-if="!autoCheckCells"
                    @click="checkCell()"
                >Check Cell</button>
                <button
                    class="button"
                    @click="revealCell()"
                >Reveal Cell</button>
                <button
                    class="button"
                    @click="promoteSingles()"
                >Promote Singles</button>
                <br />
                <button
                    class="button"
                    @click="reset()"
                >Reset</button>
                <button
                    class="button"
                    @click="showSolution()"
                >Solve</button>
                <button
                    class="button"
                    @click="newGame()"
                >New Game</button>
            </div>
            <br />

            <hr
                width="80%"
                style="margin: 0 auto"
            >
            <br />

            <button
                @click="fillCandidates = true"
                :class="[fillCandidates ? 'selected' : '']"
                style="margin: 5px"
            >Fill Candidates</button>
            <button
                @click="fillCandidates = false"
                :class="[!fillCandidates ? 'selected' : '']"
                style="margin: 5px"
            >Answer</button>
            <div
                id="numbers"
                class="grid3"
            >
                <template v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]">
                    <button
                        class="number"
                        :id="n.toString()"
                        @mouseover="highlightValue = n"
                        @mouseleave="highlightValue = selectedCell?.value ?? null"
                        @click="setCellValue(n)"
                    >
                        <div style="display: flex; flex-direction: column; aspect-ratio: 1;">
                            <span>{{ n }}</span>
                            <span style="font-size:x-small; color: rgb(100, 100, 100);">
                                ({{ getCount(n) }} / 9)
                            </span>
                        </div>
                    </button>
                </template>

            </div>
            <button
                class="number"
                id="clearCellButton"
                @click="clearCellValue()"
            >
                X
            </button>
        </v-col>
    </v-row>


</template>

<script
    setup
    lang='ts'
>
export interface Cell {
    value: number | null;
    type: 'given' | 'filled' | 'candidate';
    candidates: number[];
    selected: boolean;
    highlight: boolean;
    check: boolean;
    coordinates: { row: number, col: number };
    answer: number;
}

const Difficulty = {
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
    EXPERT: "expert",
}

import { ref, onBeforeMount, onMounted } from 'vue'
import { useSudokuStore } from '../stores/SudokuStore';

import Title from '../../../components/Title.vue';
import Cell from '../components/Cell.vue';

const sudokuStore = useSudokuStore();

const autoCheckCells = ref(false);
const defaultCell = { selected: false, highlight: false, check: autoCheckCells.value, value: null, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9], type: "candidate", coordinates: { row: 0, col: 0 }, answer: 0 } as Cell;
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
const fillCandidates = ref(true);
let solution: number[][] = [[]];

onBeforeMount(() => {
    sudokuStore.getBoard();
    reset();
    // autoCandidate();
});

function newGame() {
    sudokuStore.getBoard();
    reset();
    // autoCandidate();
}

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
    solution = board.value.map(line => line.map(cell => cell.value ?? 0)) as number[][];
    solve();
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
            board.value[row][col].answer = solution[row][col]
        )
    );
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

function getCount(value: number) {
    return board.value.flat().filter(cell => cell.value == value).length;
}

function highlightConnectedCells(row: number, col: number) {
    highlightedCells.value = [];
    const block = getBlock(row, col).flat();
    const boardRow = board.value[row];
    const boardColumn = board.value.map(line => line[col]);
    highlightedCells.value = [...block, ...boardRow, ...boardColumn];
}

function selectCell(row: number, col: number) {
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
    // console.log(event.key, selectedCell.value, selectedCell.value?.coordinates);
    if (!selectedCell.value) return;

    let row = selectedCell.value.coordinates.row;
    let col = selectedCell.value.coordinates.col;

    if (event.key == ' ') {
        fillCandidates.value = !fillCandidates.value;
        return;
    }

    if (event.key == 'ArrowUp') {
        row = row > 0 ? row - 1 : 8;
        if (event.ctrlKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count <= 9) {
                row = row > 0 ? row - 1 : 8;
                count++;
            }
        }
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowDown') {
        row = row < 8 ? row + 1 : 0;
        if (event.ctrlKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count <= 9) {
                row = row < 8 ? row + 1 : 0;
                count++;
            }
        }
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowLeft') {
        col = col > 0 ? col - 1 : 8;
        if (event.ctrlKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count <= 9) {
                col = col > 0 ? col - 1 : 8;
                count++;
            }
        }
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowRight') {
        col = col < 8 ? col + 1 : 0;
        if (event.ctrlKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count <= 9) {
                col = col < 8 ? col + 1 : 0;
                count++;
            }
        }
        selectCell(row, col);
        return;
    }

    if (selectedCell.value.type != 'given') {
        if (!["1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete"].includes(event.key)) return;

        if (["Backspace", "Delete"].includes(event.key)) {
            clearCellValue();
        } else {
            setCellValue(parseInt(event.key));
        }
    }
}

function setCellValue(value: number) {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;

    if (fillCandidates.value) {
        if (!selectedCell.value.candidates.includes(value)) {
            selectedCell.value.candidates.push(value);
        } else {
            selectedCell.value.candidates = selectedCell.value.candidates.filter(candidate => candidate != value);
        }
    } else {
        selectedCell.value.value = value;
        selectedCell.value.type = 'filled';
        removeCandidateFromConnectedCells(value, selectedCell.value.coordinates.row, selectedCell.value.coordinates.col);
    }
    highlightValue.value = value;
}

function clearCellValue() {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;

    if (!fillCandidates.value) {
        selectedCell.value.value = null;
        selectedCell.value.type = 'candidate';
    }
    // selectedCell.value.candidates = getCellCandidates(selectedCell.value.coordinates.row, selectedCell.value.coordinates.col);

    highlightValue.value = null;
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

function revealCell() {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;
    selectedCell.value.value = selectedCell.value.answer;
    selectedCell.value.type = 'filled';
    removeCandidateFromConnectedCells(selectedCell.value.answer, selectedCell.value.coordinates.row, selectedCell.value.coordinates.col);
}

function checkCell() {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;
    selectedCell.value.check = true;
}

function updateCheckCells() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col => {
            board.value[row][col].check = autoCheckCells.value;
        })
    );
}

</script>

<style
    lang="css"
    scoped
>
.grid3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

#board {
    width: 18cm;
    margin: 0 auto;
}

.cell {
    border: solid 1px gray;
    border-collapse: collapse;
    z-index: 2;
    width: 2cm;
    height: 2cm;
    align-content: center;
}

.block {
    border: solid 1px black;
    z-index: 3
}

#numbers {
    align-content: center;
    margin: 0 auto;
    width: 8cm;
}

.number {
    margin: 5px;
    font-size: 20px;
    font-weight: bold;
    border-radius: 5px;
    border: solid 1px gray;
    background-color: lightgray;
}

.selected {
    border: 2px solid black
}

.button {
    appearance: none;
    background-color: #FAFBFC;
    border: 1px solid rgba(27, 31, 35, 0.15);
    border-radius: 6px;
    box-shadow: rgba(27, 31, 35, 0.04) 0 1px 0, rgba(255, 255, 255, 0.25) 0 1px 0 inset;
    box-sizing: border-box;
    color: #24292E;
    cursor: pointer;
    display: inline-block;
    font-family: -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    list-style: none;
    padding: 6px 10px;
    margin: 4px;
    position: relative;
    transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: middle;
    white-space: nowrap;
    word-wrap: break-word;
}

.button:hover {
    background-color: #F3F4F6;
    text-decoration: none;
    transition-duration: 0.1s;
}

.button:disabled {
    background-color: #FAFBFC;
    border-color: rgba(27, 31, 35, 0.15);
    color: #959DA5;
    cursor: default;
}

.button:active {
    background-color: #EDEFF2;
    box-shadow: rgba(225, 228, 232, 0.2) 0 1px 0 inset;
    transition: none 0s;
}

.button:focus {
    outline: 1px transparent;
}

.button:before {
    display: none;
}

.button:-webkit-details-marker {
    display: none;
}
</style>