<template>
    <container>
        <Title>Sudoku</Title>
        <div
            id="board"
            class="grid"
            tabindex="0"
            @keyup="handleKeyUp($event)"
            @keyup.escape="esc()"
        >
            <template v-for="l in [1, 2, 3]">
                <template v-for="c in [1, 2, 3]">
                    <div class="block">
                        <template v-for="line, li in sudokuStore.board.slice((l - 1) * 3, l * 3)">
                            <template
                                v-for="cellValue, ci in line.slice((c - 1) * 3, c * 3)"
                                :key="`${li + (l - 1) * 3}-${ci + (c - 1) * 3}`"
                            >
                                <div
                                    class="cell"
                                    @click="selectedCell = board[ci + (c - 1) * 3][li + (l - 1) * 3]"
                                >
                                    <cell
                                        :key="`cell${li + (l - 1) * 3}-${ci + (c - 1) * 3}`"
                                        :coordinates="{ y: li + (l - 1) * 3, x: ci + (c - 1) * 3 }"
                                        :type="board[li + (l - 1) * 3][ci + (c - 1) * 3].type"
                                        :candidates="board[li + (l - 1) * 3][ci + (c - 1) * 3].candidates"
                                        :value="board[li + (l - 1) * 3][ci + (c - 1) * 3].value"
                                        :selected="board[li + (l - 1) * 3][ci + (c - 1) * 3].selected"
                                        :highlight="highlightedCells.includes(board[li + (l - 1) * 3][ci + (c - 1) * 3])"
                                        :highlightValue="highlightValue"
                                        style="height: 100%; width: 100%;"
                                        @click="selectCell(ci + (c - 1) * 3, li + (l - 1) * 3)"
                                    ></cell>
                                </div>
                            </template>
                        </template>
                    </div>
                </template>
            </template>
        </div>
        <div style="display: flex; justify-content: center; align-items: center;">
            <button @click="sudokuStore.solve()">Solve</button>
            <!-- <button @click="sudokuStore.clear()">Clear</button> -->
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
    coordinates: { x: number, y: number };
}

import { ref, onBeforeMount, onMounted } from 'vue'

import { useSudokuStore } from '@/modules/sudoku/stores/SudokuStore';

import Title from '@/components/Title.vue';
import cell from '../components/cell.vue';
import candidates from '../components/candidates.vue';

const sudokuStore = useSudokuStore();

const defaultCell = { selected: false, highlight: false, value: null, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9], type: "candidate", coordinates: { x: 0, y: 0 } } as Cell;
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

onBeforeMount(() => {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(x =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(y => {
            board.value[y][x] = {
                ...defaultCell,
                value: sudokuStore.board[y][x],
                coordinates: { x, y },
            };
            if (sudokuStore.board[y][x]) {
                board.value[y][x].type = 'given';
                board.value[y][x].candidates = [];
                board.value[y][x].value = sudokuStore.board[y][x];
            }
        })
    );
    autoCandidate();
});

function getBlock(x: number, y: number) {
    y = Math.floor(y / 3);
    x = Math.floor(x / 3);
    return board.value.slice(y * 3, y * 3 + 3).map(line => line.slice(x * 3, x * 3 + 3));
}

function getBlockValues(x: number, y: number) {
    return getBlock(x, y).flat().map(cell => cell.value);
}

function getCellCandidates(x: number, y: number) {
    const possibleCandidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const block = getBlockValues(x, y);
    const row = board.value[y].map(cell => cell.value);
    const column = board.value.map(line => line[x].value);
    const candidates = possibleCandidates.filter(candidate => {
        return ![...column, ...row, ...block].includes(candidate);
    });
    return candidates;
}

function autoCandidate() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(x =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(y =>
            board.value[y][x].candidates = getCellCandidates(x, y)
        )
    );
}

function removeCandidateFromConnectedCells(value: number, x: number, y: number) {
    const block = getBlock(x, y).flat();
    const row = board.value[y];
    const column = board.value.map(line => line[x]);
    console.log([row, column, block].flat().filter(cell => cell.type == 'candidate').map(cell => cell.candidates));
    [row, column, block].flat().map(cell => {
        if (cell.type == 'candidate') {
            cell.candidates = cell.candidates.filter(candidate => candidate != value);
        }
    });
}

function highlightConnectedCells(x: number, y: number) {
    highlightedCells.value = [];
    const block = getBlock(x, y).flat();
    const row = board.value[y];
    const column = board.value.map(line => line[x]);
    highlightedCells.value = [...block, ...row, ...column];
}

function selectCell(x: number, y: number) {
    highlightValue.value = board.value[y][x].value;
    selectedCell.value = board.value[y][x];
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(x =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(y => {
            board.value[y][x].selected = false;
            board.value[y][x].highlight = false;
        })
    );
    board.value[y][x].selected = true;
    highlightConnectedCells(x, y);
}

function promoteSingles() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(x =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(y => {
            if (board.value[y][x].type == 'candidate' && board.value[y][x].candidates.length == 1) {
                const value = board.value[y][x].candidates[0];
                board.value[y][x].value = value;
                board.value[y][x].type = 'filled';
                removeCandidateFromConnectedCells(value, x, y);
            }
        })
    );
}

function handleKeyUp(event: KeyboardEvent) {
    if (!selectedCell.value || selectedCell.value.type == 'given') return;
    if (!["1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete"].includes(event.key)) return;

    const x = selectedCell.value.coordinates.x;
    const y = selectedCell.value.coordinates.y;

    if (["Backspace", "Delete"].includes(event.key)) {
        board.value[x][y].value = null;
        board.value[x][y].type = 'candidate';
        board.value[x][y].candidates = getCellCandidates(x, y);
        highlightValue.value = null;
    } else {
        board.value[x][y].value = parseInt(event.key);
        board.value[x][y].type = 'filled';
        highlightValue.value = parseInt(event.key);
        removeCandidateFromConnectedCells(parseInt(event.key), y, x);
        // autoCandidate();
    }
}

function esc() {
    selectedCell.value = null;
    highlightValue.value = null;
    highlightedCells.value = [];
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(x =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(y =>
            board.value[y][x].selected = false
        )
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