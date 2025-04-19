<template>
    <div id="game-header">
        <Title>
            Sudoku
        </Title>
        <button
            id="play-button"
            @click="showNewGameDialog = true"
        >
            <v-icon id="play-button-icon">mdi-play</v-icon>
        </button>
        <div id="gameMode">
            <v-radio-group
                v-model="gameMode"
                @update:modelValue="changeMode($event)"
                inline
                hide-details
            >
                <v-radio
                    label="Zen"
                    :value="GameMode.Zen"
                ></v-radio>
                <v-radio
                    label="3 Strikes"
                    :value="GameMode.ThreeStrikes"
                ></v-radio>
            </v-radio-group>
            <div
                id="hearts"
                v-if="gameMode == GameMode.ThreeStrikes"
            >
                <template v-for="i in [3, 2, 1]">
                    <v-icon :color="i > errors ? 'red' : '#33333355'">mdi-heart-circle-outline</v-icon>
                </template>
            </div>
        </div>
        <div class="writing-tools-top">
            <v-btn-toggle
                divided
                v-model="fillCandidates"
                color="primary"
            >
                <v-btn
                    :value="true"
                    title="Candidates"
                >
                    <v-icon end>
                        mdi-pencil
                    </v-icon>
                </v-btn>

                <v-btn
                    :value="false"
                    title="Answer"
                >
                    <v-icon start>
                        mdi-pen
                    </v-icon>
                </v-btn>
            </v-btn-toggle>
        </div>
    </div>

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
                                    <div class="cell">
                                        <Cell
                                            :type="cell.type"
                                            :candidates="cell.candidates"
                                            :value="cell.value"
                                            :selected="cell.selected"
                                            :highlight="highlightedCells.includes(cell)"
                                            :highlightValue="highlightValue"
                                            :check="autoCheckCells || cell.check"
                                            :answer="cell.answer"
                                            :color="cell.color"
                                            @click="selectCell(cell.coordinates.row, cell.coordinates.col, true, $event)"
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
            <div class="writing-tools">
                <v-btn-toggle
                    divided
                    v-model="fillCandidates"
                    color="primary"
                >
                    <v-btn :value="true">
                        Candidates
                        <v-icon end>
                            mdi-pencil
                        </v-icon>
                    </v-btn>

                    <v-btn :value="false">
                        <v-icon start>
                            mdi-pen
                        </v-icon>
                        Answer
                    </v-btn>
                </v-btn-toggle>
            </div>
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
                        :disabled="getCount(n) >= 9"
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
                class="number eraser"
                id="clearCellButton"
                @click="clearCellValue()"
            >
                <v-icon>mdi-eraser</v-icon>
                Erase
            </button>

            <div id="filterBox">
                <v-text-field
                    v-model="searchQuery"
                    placeholder="Search Tool"
                    class="mt-2"
                    @input="filterCandidates"
                    prepend-inner-icon="mdi-magnify"
                    hide-details
                ></v-text-field>
            </div>

            <div id="actions">
                <span
                    style="padding: 0.6em;"
                    class="checkbox"
                >
                    <input
                        id="autoCheckCells"
                        type="checkbox"
                        v-model="autoCheckCells"
                        label="Auto Check"
                        @change="updateCheckCells()"
                        :disabled="gameMode == GameMode.ThreeStrikes"
                    />
                    <label
                        for="autoCheckCells"
                        style="font-weight:500;"
                    > Auto Check</label>
                </span>
                <button
                    class="button"
                    v-if="!autoCheckCells"
                    @click="checkCell()"
                >Check Cell</button>
                <button
                    class="button"
                    @click="autoCandidate()"
                >Auto Candidate</button>
                <button
                    class="button"
                    @click="promoteSingles()"
                >Promote Singles</button>
                <button
                    class="button"
                    @click="markCells()"
                >{{ markCellsText }}</button>
                <button
                    class="button"
                    @click="revealCell()"
                >Reveal Cell</button>
                <button
                    class="button"
                    @click="showSolution()"
                >Solve</button>
                <button
                    class="button"
                    @click="reset()"
                >Reset</button>
                <button
                    class="button"
                    @click="undo()"
                >Undo</button>
                <button
                    class="button"
                    @click="showNewGameDialog = true"
                >New Game</button>
            </div>
        </v-col>
    </v-row>

    <v-dialog
        max-width="500"
        v-model="finished"
    >
        <v-card :title="finishedTitle">
            <v-card-text>
                {{ finishedMessage }}
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    text="New Game"
                    @click="showNewGameDialog = true"
                ></v-btn>
                <v-btn
                    text="Review"
                    @click="() => { finished = false; gameMode = GameMode.Zen; }"
                ></v-btn>
                <v-btn
                    v-if="!finishedStatus"
                    text="Retry"
                    @click="reset();"
                ></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
        max-width="200"
        v-model="showNewGameDialog"
    >
        <v-card>
            <v-card-title style="text-align: center;">
                New Game
            </v-card-title>
            <v-card-text class="d-flex flex-column">
                <template v-for="[k, v] of Object.entries(Difficulty)">
                    <v-btn
                        class="button difficulty-button justify-center align-center"
                        text
                        @click="newGame(v)"
                    >{{ k }}</v-btn>
                </template>
            </v-card-text>
        </v-card>
    </v-dialog>

    <v-dialog
        max-width="350"
        v-model="showMarkCellsDialog"
    >
        <v-card>
            <v-card-title>
                <v-row>
                    <v-col cols="5">Choose Color</v-col>
                    <v-col cols="7">
                        <v-btn @click="showMarkCellsDialog = false">
                            Confirm choice
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-text class="d-flex flex-column">
                <v-color-picker
                    :swatches="swatches"
                    show-swatches
                    v-model="markColor"
                ></v-color-picker>
            </v-card-text>
            <v-card-actions>
                <v-row>
                    <v-col>
                        <v-btn @click="clearMarks()">
                            Clear marks
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn @click="clearAllMarks()">
                            Clear all marks
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang='ts'>
export interface Cell {
    value: number | null;
    type: 'given' | 'filled' | 'candidate';
    candidates: number[];
    selected: boolean;
    highlight: boolean;
    check: boolean;
    coordinates: { row: number, col: number };
    answer: number;
    color: string; // Para marcação manual com cor
    candidateColors?: Map<number, string>;
}

enum GameMode {
    Zen = "zen",
    ThreeStrikes = "threeStrikes",
}

import { ref, onBeforeMount, computed, watch } from 'vue'
import { useSudokuStore, Difficulty } from '../stores/SudokuStore';

import Title from '../../../components/Title.vue';
import Cell from '../components/Cell.vue';

const sudokuStore = useSudokuStore();

const autoCheckCells = ref(false);
const defaultCell = { selected: false, highlight: false, check: autoCheckCells.value, value: null, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9], type: "candidate", coordinates: { row: 0, col: 0 }, answer: 0, color: "#FFFFFF" } as Cell;
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
const selectedCell = ref<Cell | Cell[] | null>(null);
const highlightedCells = ref<Cell[]>([]);
const highlightValue = ref<number | null>(null);
const fillCandidates = ref(true);
const gameMode = ref(GameMode.Zen);
const finished = ref(false);
const finishedStatus = ref(false);
const finishedTitle = ref('');
const finishedMessage = ref('');
const errors = ref(0);
const showNewGameDialog = ref(false);
const isMarkingCells = ref(false);
const showMarkCellsDialog = ref(false)
const markColor = ref()
const swatches = [
    ['#FF0000', '#AA0000', '#550000'],
    ['#FFFF00', '#AAAA00', '#555500'],
    ['#00FF00', '#00AA00', '#005500'],
    ['#00FFFF', '#00AAAA', '#005555'],
    ['#0000FF', '#0000AA', '#000055'],
];
const searchQuery = ref('');
const filteredCandidates = ref<any[]>([]);

let solution: number[][] = [[]];

onBeforeMount(() => {
    loadConfig();
    if (hasSavedGame()) {
        loadSave();
    } else {
        sudokuStore.getBoard();
        reset();
    }
});

const markCellsText = computed(() => {
    return isMarkingCells.value ? 'Finish Marking' : 'Mark Cells';
})

function markCells() {
    isMarkingCells.value = !isMarkingCells.value;
    if (!isMarkingCells.value) {
        showMarkCellsDialog.value = false;
        return
    }
    showMarkCellsDialog.value = true;
}

function clearMarks() {
    markColor.value = '#FFFFFF';
    showMarkCellsDialog.value = false;
}

function clearAllMarks() {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row =>
            board.value[row][col].color = '#FFFFFF'
        )
    );
    showMarkCellsDialog.value = false;
    isMarkingCells.value = false;
}

function changeMode(mode: GameMode) {
    if (mode == GameMode.ThreeStrikes) {
        autoCheckCells.value = true;
    }
}

function newGame(difficulty: string = Difficulty.EASY) {
    sudokuStore.getBoard(difficulty);
    reset();
}

function reset() {
    deleteSave();
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map(col =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map(row => {
            if (hasSavedGame() && board.value[row][col].type == 'given') return;
            board.value[row][col] = {
                ...defaultCell,
                value: sudokuStore.board[row][col],
                coordinates: { row, col },
                candidates: [],
            };
            if (!hasSavedGame() && sudokuStore.board[row][col]) {
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
    finished.value = false;
    finishedStatus.value = false;
    finishedTitle.value = '';
    finishedMessage.value = '';
    errors.value = 0;
    showNewGameDialog.value = false;
    showMarkCellsDialog.value = false;
    isMarkingCells.value = false;

    save();
    saveChanges();
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
    saveChanges();
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

function selectCell(row: number, col: number, fromClick: boolean = false, event: Event = null) {
    if (fromClick) {
        // console.log("CLICK", event)
        if (isMarkingCells.value) {
            board.value[row][col].color = markColor.value
        }
        // if (event?.ctrlKey) {
        //     if (selectedCell.value) {
        //         alert(typeof (selectedCell.value))
        //     }
        // }
    }
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
                let removeCandidates = true;
                if (autoCheckCells.value && cell.value != cell.answer) removeCandidates = false;
                if (removeCandidates) removeCandidateFromConnectedCells(value, row, col);
                handleStrikes(cell);
            }
        })
    );
    handleFinish();
    save();
    saveChanges();
}

function handleKeyUp(event: KeyboardEvent) {
    // console.log(event.key, selectedCell.value, selectedCell.value?.coordinates);
    // Ctrl + C => Auto candidates
    // if (event.ctrlKey && event.altlKey) {
    //     console.log(event.key, event)
    //     event.preventDefault()
    // }

    if (!selectedCell.value) return;

    let row = selectedCell.value.coordinates.row;
    let col = selectedCell.value.coordinates.col;

    if (event.key == ' ') {
        fillCandidates.value = !fillCandidates.value;
        return;
    }

    if (event.ctrlKey && event.key == 'z') {
        undo();
        return;
    }

    if (event.key == 'ArrowUp') {
        row = row > 0 ? row - 1 : 8;
        if (event.shiftKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count < 9) {
                row = row > 0 ? row - 1 : 8;
                count++;
            }
        } else {
            if (event.ctrlKey) {
                row = row == 0 ? 8 : 0;
            }
        }
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowDown') {
        row = row < 8 ? row + 1 : 0;
        if (event.shiftKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count < 9) {
                row = row < 8 ? row + 1 : 0;
                count++;
            }
        } else {
            if (event.ctrlKey) {
                row = row == 8 ? 0 : 8;
            }
        }
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowLeft') {
        col = col > 0 ? col - 1 : 8;
        if (event.shiftKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count < 9) {
                col = col > 0 ? col - 1 : 8;
                count++;
            }
        } else {
            if (event.ctrlKey) {
                col = col == 0 ? 8 : 0;
            }
        }
        selectCell(row, col);
        return;
    }
    if (event.key == 'ArrowRight') {
        col = col < 8 ? col + 1 : 0;
        if (event.shiftKey) {
            let count = 0;
            while (board.value[row][col].type != 'candidate' && count < 9) {
                col = col < 8 ? col + 1 : 0;
                count++;
            }
        } else {
            if (event.ctrlKey) {
                col = col == 8 ? 0 : 8;
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
        handleStrikes(selectedCell.value);
        removeCandidateFromConnectedCells(value, selectedCell.value.coordinates.row, selectedCell.value.coordinates.col);
    }
    highlightValue.value = value;
    handleFinish();
    saveChanges();
    save();
}

function clearCellValue() {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;

    selectedCell.value.value = null;
    selectedCell.value.type = 'candidate';

    // selectedCell.value.candidates = getCellCandidates(selectedCell.value.coordinates.row, selectedCell.value.coordinates.col);

    highlightValue.value = null;
    saveChanges();
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
    isMarkingCells.value = false;
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
    saveChanges();
}

function revealCell() {
    if (!selectedCell.value) return;
    if (selectedCell.value.type == 'given') return;
    selectedCell.value.value = selectedCell.value.answer;
    selectedCell.value.type = 'filled';
    removeCandidateFromConnectedCells(selectedCell.value.answer, selectedCell.value.coordinates.row, selectedCell.value.coordinates.col);
    saveChanges();
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

function isFinished() {
    return board.value.flat().filter(cell => [null, NaN, 0].includes(cell.value)).length == 0;
}

function handleFinish() {
    if (finished.value) return; // already finished (probably from handleStrikes())
    const allFilled = isFinished();
    if (allFilled) {
        if (autoCheckCells.value) {
            finishedStatus.value = board.value.flat().filter(cell => cell.value == cell.answer).length == 81;
            finishedTitle.value = finishedStatus.value ? 'Congratulations!' : 'Oops!';
            finishedMessage.value = finishedStatus.value ? 'Congratulations! You have successfully solved this Sudoku puzzle!' : 'It seems you have some mistakes in your solution! Try Again!';
        }
        finished.value = true;
    }
}

function handleStrikes(cell: Cell) {
    if (gameMode.value != GameMode.ThreeStrikes) return;
    if (cell.value != cell.answer) errors.value++;
    if (errors.value >= 3) {
        finishedStatus.value = false;
        finishedTitle.value = "Ooops! [3 STRIKES! YOU'RE OUT!]";
        finishedMessage.value = 'You have made 3 mistakes! Game Over!';
        finished.value = true;
    }
}

function hasSavedGame() {
    return localStorage.getItem('sudoku-currentGame') != null;
}

function hasSavedConfig() {
    return localStorage.getItem('sudoku-config') != null;
}

function save() {
    let localSave: any = {
        board: board.value,
        errors: errors.value,
    };
    localStorage.setItem('sudoku-currentGame', btoa(JSON.stringify(localSave)));
    let sudokuConfig = {
        autoCheckCells: autoCheckCells.value,
        gameMode: gameMode.value,
    };
    localStorage.setItem('sudoku-config', JSON.stringify(sudokuConfig));
}

function loadSave() {
    let localSave: any = JSON.parse(atob(localStorage.getItem('sudoku-currentGame') ?? ''));
    errors.value = localSave.errors;
    board.value = localSave.board;
}

function deleteSave() {
    localStorage.removeItem('sudoku-currentGame');
    localStorage.removeItem('sudoku-changes');
}

function loadConfig() {
    if (!hasSavedConfig()) return;
    let sudokuConfig = JSON.parse(localStorage.getItem('sudoku-config') ?? '{}');
    autoCheckCells.value = sudokuConfig.autoCheckCells;
    gameMode.value = sudokuConfig.gameMode;
}

function saveChanges() {
    let changes = JSON.parse(localStorage.getItem('sudoku-changes') ?? JSON.stringify([{ board: board.value, selectedCell: selectedCell.value }]));
    changes.push({ board: board.value, selectedCell: selectedCell.value });
    localStorage.setItem('sudoku-changes', JSON.stringify(changes));
}

function undo() {
    let changes = JSON.parse(localStorage.getItem('sudoku-changes') ?? JSON.stringify([board.value]));
    let state = changes.pop();
    board.value = state.board;
    if (state.selectedCell) selectCell(state.selectedCell.coordinates.row, state.selectedCell.coordinates.col);
    if (changes.length == 0) changes.push({ board: board.value, selectedCell: selectedCell.value });
    localStorage.setItem('sudoku-changes', JSON.stringify(changes));
}

/* ****************************FILTER************************************ */
function contains(cell: any, values: number[]): boolean {
    if (cell.value) return values.includes(cell.value);
    return cell.candidates.some(candidate => values.includes(candidate));
}

function notContains(cell: any, values: number[]): boolean {
    if (cell.value) return !values.includes(cell.value);
    return !cell.candidates.some(candidate => values.includes(candidate));
}

function only(cell: any, values: number[]): boolean {
    if (cell.value) return values.length === 1 && cell.value === values[0];
    return cell.candidates.length === values.length && cell.candidates.every(candidate => values.includes(candidate));
}

// Função para encontrar candidatos únicos (Hidden Singles) e retornar as células e os candidatos
function findUniqueCandidates(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cell: Cell, candidates: number[] }> {
    const uniqueCandidateInfo: Array<{ cell: Cell, candidates: number[] }> = [];

    board.forEach(row => {
        row.forEach(cell => {
            // Processa apenas células candidatas que estão dentro do universo especificado
            const isCellInUniverse =
                (universe.rows.length === 0 || universe.rows.includes(cell.coordinates.row + 1)) &&
                (universe.cols.length === 0 || universe.cols.includes(cell.coordinates.col + 1)) &&
                (universe.blocks.length === 0 || universe.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col))); // Assume getBlockNumber está definida

            if (isCellInUniverse && (cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.length > 0) {

                const { row: r, col: c } = cell.coordinates;
                const blockNumber = getBlockNumber(r, c);
                const uniqueCandsInCell: number[] = []; // Para armazenar os candidatos únicos encontrados nesta célula

                // Verifica cada candidato na célula
                for (const candidate of cell.candidates) {
                    let isUniqueInRelevantUnit = false; // Flag para saber se o candidato é único em *alguma* unidade relevante

                    // 1. Verificar unicidade na LINHA (se a linha estiver no universo OU se não houver restrição de linhas)
                    if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
                        let foundOtherCellWithCandidate = false;
                        for (let cc = 0; cc < 9; cc++) {
                            const otherCell = board[r][cc];
                            if (otherCell !== cell && (otherCell.value === null || otherCell.value === 0) && otherCell.candidates && otherCell.candidates.includes(candidate)) {
                                foundOtherCellWithCandidate = true;
                                break; // Encontramos outra célula com o mesmo candidato na linha
                            }
                        }
                        if (!foundOtherCellWithCandidate) {
                            isUniqueInRelevantUnit = true; // O candidato é único nesta linha relevante
                        }
                    }

                    // Se for único em uma unidade relevante, adiciona e passa para o próximo candidato desta célula
                    if (isUniqueInRelevantUnit) {
                        uniqueCandsInCell.push(candidate);
                        continue;
                    }

                    // 2. Verificar unicidade na COLUNA (se a coluna estiver no universo OU sem restrição)
                    if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
                        let foundOtherCellWithCandidate = false;
                        for (let rr = 0; rr < 9; rr++) {
                            const otherCell = board[rr][c];
                            if (otherCell !== cell && (otherCell.value === null || otherCell.value === 0) && otherCell.candidates && otherCell.candidates.includes(candidate)) {
                                foundOtherCellWithCandidate = true;
                                break; // Encontramos outra célula com o mesmo candidato na coluna
                            }
                        }
                        if (!foundOtherCellWithCandidate) {
                            isUniqueInRelevantUnit = true; // O candidato é único nesta coluna relevante
                        }
                    }

                    if (isUniqueInRelevantUnit) {
                        uniqueCandsInCell.push(candidate);
                        continue;
                    }

                    // 3. Verificar unicidade no BLOCO (se o bloco estiver no universo OU sem restrição)
                    if (universe.blocks.length === 0 || universe.blocks.includes(blockNumber)) {
                        let foundOtherCellWithCandidate = false;
                        const blockRowStart = Math.floor(r / 3) * 3;
                        const blockColStart = Math.floor(c / 3) * 3;
                        for (let br = blockRowStart; br < blockRowStart + 3; br++) {
                            for (let bc = blockColStart; bc < blockColStart + 3; bc++) {
                                const otherCell = board[br][bc];
                                if (otherCell !== cell && (otherCell.value === null || otherCell.value === 0) && otherCell.candidates && otherCell.candidates.includes(candidate)) {
                                    foundOtherCellWithCandidate = true;
                                    break;
                                }
                            }
                            if (foundOtherCellWithCandidate) break;
                        }
                        if (!foundOtherCellWithCandidate) {
                            isUniqueInRelevantUnit = true; // O candidato é único neste bloco relevante
                        }
                    }

                    // Se chegou até aqui e isUniqueInRelevantUnit é true, significa que é único em pelo menos uma unidade relevante
                    if (isUniqueInRelevantUnit) {
                        uniqueCandsInCell.push(candidate);
                    }
                }

                // Se algum candidato nesta célula foi encontrado como único em uma unidade relevante, adiciona a informação
                if (uniqueCandsInCell.length > 0) {
                    uniqueCandidateInfo.push({ cell: cell, candidates: uniqueCandsInCell });
                }
            }
        });
    });

    return uniqueCandidateInfo; // Retorna a lista de células e os candidatos únicos encontrados em cada uma
}

/**
 * Encontra Pares Nus (Naked Pairs) no tabuleiro dentro das unidades especificadas pelo universo, retornando instâncias.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Uma lista de objetos, onde cada objeto representa uma instância de Naked Pair com suas células e candidatos.
 */
function findNakedPairs(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cells: Cell[], candidates: number[] }> {
    // Lista para armazenar as instâncias de Pares Nus encontradas.
    // Cada item será um objeto { cells: [cell1, cell2], candidates: [cand1, cand2] }
    const nakedPairInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
    // Usamos um Set para rastrear pares de células (instâncias) já adicionados, para evitar adicionar a mesma instância de Naked Pair mais de uma vez (por exemplo, se for encontrada em uma linha e em um bloco simultaneamente - embora raro com Naked Pairs).
    // Criamos uma chave única para cada par de células e candidatos para garantir a unicidade da instância.
    const addedInstances = new Set<string>();


    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Pares Nus
    const checkUnitForNakedPairs = (unitCells: Cell[]) => {
        // Filtra apenas as células que são vazias (valor null ou 0), têm candidatos
        // e cujo número de candidatos é EXATAMENTE 2 (requisito para Naked Pairs).
        const candidateCellsInUnit = unitCells.filter(cell =>
            (cell.value === null || cell.value === 0) &&
            cell.candidates &&
            cell.candidates.length === 2
        );

        // Precisamos de pelo menos 2 células candidatas com 2 candidatos nesta unidade
        if (candidateCellsInUnit.length < 2) {
            return;
        }

        // Itera por todos os pares distintos de células candidatas com 2 candidatos na unidade
        for (let i = 0; i < candidateCellsInUnit.length; i++) {
            const cell1 = candidateCellsInUnit[i];

            for (let j = i + 1; j < candidateCellsInUnit.length; j++) {
                const cell2 = candidateCellsInUnit[j];

                // Verifica se as duas células têm EXATAMENTE o mesmo par de candidatos.
                // Usamos slice() antes de sort() para não modificar o array original.
                // Comparar a representação string de arrays ordenados verifica se os conjuntos de candidatos são iguais.
                if (cell1.candidates.slice().sort().toString() === cell2.candidates.slice().sort().toString()) {
                    // Encontramos uma instância de Naked Pair!
                    const nakedCandidates = cell1.candidates.slice().sort(); // O par de candidatos (ordenado)
                    // Ordenamos as células por coordenadas para criar uma chave de instância consistente
                    const pairCells = [cell1, cell2].sort((a, b) => {
                        if (a.coordinates.row !== b.coordinates.row) return a.coordinates.row - b.coordinates.row;
                        return a.coordinates.col - b.coordinates.col;
                    });

                    // Cria uma chave única para esta instância do par de células com esses candidatos
                    const instanceKey = `${pairCells[0].coordinates.row}-${pairCells[0].coordinates.col}-${pairCells[1].coordinates.row}-${pairCells[1].coordinates.col}-${nakedCandidates.join(',')}`;

                    // Adiciona a instância à lista se ainda não foi adicionada
                    if (!addedInstances.has(instanceKey)) {
                        nakedPairInstances.push({ cells: pairCells, candidates: nakedCandidates });
                        addedInstances.add(instanceKey); // Marca a instância como adicionada
                    }
                }
            }
        }
    };

    // Verifica as Linhas dentro do universo especificado
    for (let r = 0; r < 9; r++) {
        if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
            checkUnitForNakedPairs(getUnitCells(board, 'row', r));
        }
    }

    // Verifica as Colunas dentro do universo especificado
    for (let c = 0; c < 9; c++) {
        if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
            checkUnitForNakedPairs(getUnitCells(board, 'col', c));
        }
    }

    // Verifica os Blocos dentro do universo especificado
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) { // Índices de bloco 0-8
        if (universe.blocks.length === 0 || universe.blocks.includes(blockIndex + 1)) { // Universo usa números de bloco 1-9
            checkUnitForNakedPairs(getUnitCells(board, 'block', blockIndex));
        }
    }

    // Retorna a lista de instâncias distintas de Naked Pairs encontradas
    return nakedPairInstances;
}

// Assume que as funções auxiliares getUnitCells e getBlockNumber estão definidas em outro lugar
// function getUnitCells(board: Cell[][], type: 'row' | 'col' | 'block', index: number): Cell[] { ... }
// function getBlockNumber(row: number, col: number): number { ... }

/**
 * Encontra Trios Nus (Naked Triples) no tabuleiro dentro das unidades especificadas pelo universo, retornando instâncias.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Uma lista de objetos, onde cada objeto representa uma instância de Trio Nu com suas células e candidatos.
 */
function findNakedTriples(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cells: Cell[], candidates: number[] }> {
    // Lista para armazenar as instâncias de Trios Nus encontradas.
    // Cada item será um objeto { cells: [cell1, cell2, cell3], candidates: [cand1, cand2, cand3] }
    const nakedTripleInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
    // Usamos um Set para rastrear trios de células (instâncias) já adicionados, para evitar adicionar a mesma instância mais de uma vez.
    // Criamos uma chave única para cada trio de células e candidatos para garantir a unicidade da instância.
    const addedInstances = new Set<string>();


    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Trios Nus
    const checkUnitForNakedTriples = (unitCells: Cell[]) => {
        // Filtra apenas as células que são vazias (valor null ou 0), têm candidatos
        // e cujo número de candidatos é <= 3 (células em um Naked Triple têm 2 ou 3 candidatos).
        const candidateCellsInUnit = unitCells.filter(cell =>
            (cell.value === null || cell.value === 0) &&
            cell.candidates &&
            cell.candidates.length >= 2 && cell.candidates.length <= 3 // Células em um Naked Triple têm 2 ou 3 candidatos
        );

        // Precisamos de pelo menos 3 células candidatas com 2 ou 3 candidatos nesta unidade
        if (candidateCellsInUnit.length < 3) {
            return;
        }

        // Itera por todas as combinações possíveis de 3 células distintas na lista de células candidatas da unidade
        for (let i = 0; i < candidateCellsInUnit.length; i++) {
            const cell1 = candidateCellsInUnit[i];

            for (let j = i + 1; j < candidateCellsInUnit.length; j++) {
                const cell2 = candidateCellsInUnit[j];

                for (let k = j + 1; k < candidateCellsInUnit.length; k++) {
                    const cell3 = candidateCellsInUnit[k];

                    // Calcula a união dos candidatos dessas três células
                    const combinedCandidatesSet = new Set<number>();
                    cell1.candidates.forEach(c => combinedCandidatesSet.add(c));
                    cell2.candidates.forEach(c => combinedCandidatesSet.add(c));
                    cell3.candidates.forEach(c => combinedCandidatesSet.add(c));

                    // Se o tamanho da união for EXATAMENTE 3, encontramos uma instância de Trio Nu!
                    if (combinedCandidatesSet.size === 3) {
                        const nakedCandidates = Array.from(combinedCandidatesSet).sort((a, b) => a - b); // Os 3 candidatos do trio (ordenados)
                        // Ordenamos as células por coordenadas para criar uma chave de instância consistente
                        const tripleCells = [cell1, cell2, cell3].sort((a, b) => {
                            if (a.coordinates.row !== b.coordinates.row) return a.coordinates.row - b.coordinates.row;
                            return a.coordinates.col - b.coordinates.col;
                        });

                        // Cria uma chave única para esta instância do trio de células com esses candidatos
                        const instanceKey = `${tripleCells[0].coordinates.row}-${tripleCells[0].coordinates.col}-${tripleCells[1].coordinates.row}-${tripleCells[1].coordinates.col}-${tripleCells[2].coordinates.row}-${tripleCells[2].coordinates.col}-${nakedCandidates.join(',')}`;


                        // Adiciona a instância à lista se ainda não foi adicionada
                        if (!addedInstances.has(instanceKey)) {
                            nakedTripleInstances.push({ cells: tripleCells, candidates: nakedCandidates });
                            addedInstances.add(instanceKey); // Marca a instância como adicionada
                        }
                    }
                }
            }
        }
    };

    // Verifica as Linhas dentro do universo especificado (ou todas se o universo de linhas for vazio)
    for (let r = 0; r < 9; r++) {
        if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
            checkUnitForNakedTriples(getUnitCells(board, 'row', r));
        }
    }

    // Verifica as Colunas dentro do universo especificado (ou todas se o universo de colunas for vazio)
    for (let c = 0; c < 9; c++) {
        if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
            checkUnitForNakedTriples(getUnitCells(board, 'col', c));
        }
    }

    // Verifica os Blocos dentro do universo especificado (ou todos se o universo de blocos for vazio)
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) { // Índices de bloco 0-8
        if (universe.blocks.length === 0 || universe.blocks.includes(blockIndex + 1)) { // Universo usa números de bloco 1-9
            checkUnitForNakedTriples(getUnitCells(board, 'block', blockIndex));
        }
    }

    // Retorna a lista de instâncias distintas de Naked Triples encontradas
    return nakedTripleInstances;
}

// Helper function to get cells in a specific row, column, or block
function getUnitCells(board: Cell[][], type: 'row' | 'col' | 'block', index: number): Cell[] {
    if (type === 'row') {
        return board[index];
    } else if (type === 'col') {
        return board.map(row => row[index]);
    } else if (type === 'block') {
        const blockRowStart = Math.floor(index / 3) * 3;
        const blockColStart = (index % 3) * 3;
        const blockCells: Cell[] = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                blockCells.push(board[blockRowStart + r][blockColStart + c]);
            }
        }
        return blockCells;
    }
    return []; // Should not happen
}

/**
 * Encontra Pares Ocultos (Hidden Pairs) no tabuleiro dentro das unidades especificadas pelo universo, retornando instâncias.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Uma lista de objetos, onde cada objeto representa uma instância de Par Oculto com suas células e candidatos.
 */
function findHiddenPairs(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cells: Cell[], candidates: number[] }> {
    // Lista para armazenar as instâncias de Pares Ocultos encontradas.
    // Cada item será um objeto { cells: [cell1, cell2], candidates: [cand1, cand2] }
    const hiddenPairInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
    // Usamos um Set para rastrear pares de células (instâncias) já adicionados, para evitar adicionar a mesma instância mais de uma vez.
    // Criamos uma chave única para cada par de células e candidatos para garantir a unicidade da instância.
    const addedInstances = new Set<string>();


    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Pares Ocultos
    const checkUnitForHiddenPairs = (unitCells: Cell[]) => {
        // Filtra apenas as células que são vazias (valor null ou 0) e têm candidatos.
        // Células em Pares Ocultos podem ter mais de 2 candidatos inicialmente.
        const candidateCellsInUnit = unitCells.filter(cell => (cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.length > 0);

        // Precisamos de pelo menos 2 células candidatas na unidade
        if (candidateCellsInUnit.length < 2) {
            return;
        }

        // Itera por todos os pares possíveis de candidatos (1 a 9)
        for (let cand1 = 1; cand1 <= 9; cand1++) {
            for (let cand2 = cand1 + 1; cand2 <= 9; cand2++) {

                // Encontra todas as células candidatas na unidade que contêm cand1
                const cellsWithCand1 = candidateCellsInUnit.filter(cell => cell.candidates.includes(cand1));
                // Encontra todas as células candidatas na unidade que contêm cand2
                const cellsWithCand2 = candidateCellsInUnit.filter(cell => cell.candidates.includes(cand2));

                // Para ser um Hidden Pair (cand1, cand2):
                // 1. Exatamente 2 células candidatas na unidade devem conter cand1.
                // 2. Exatamente 2 células candidatas na unidade devem conter cand2.
                // 3. As duas células que contêm cand1 devem ser as MESMAS duas células que contêm cand2.

                if (cellsWithCand1.length === 2 && cellsWithCand2.length === 2) {
                    // Verifica se o conjunto de células que contém cand1 é idêntico ao conjunto de células que contém cand2.
                    const areSetsEqual = cellsWithCand1.every(cell => cellsWithCand2.includes(cell)) &&
                        cellsWithCand2.every(cell => cellsWithCand1.includes(cell));

                    if (areSetsEqual) {
                        // Encontramos uma instância de Hidden Pair para os candidatos (cand1, cand2) nessas duas células!
                        const pairCells = cellsWithCand1.sort((a, b) => { // Ordenamos as células por coordenadas para uma chave consistente
                            if (a.coordinates.row !== b.coordinates.row) return a.coordinates.row - b.coordinates.row;
                            return a.coordinates.col - b.coordinates.col;
                        });
                        const hiddenCandidates = [cand1, cand2].sort((a, b) => a - b); // Os candidatos ocultos (ordenados)

                        // Cria uma chave única para esta instância do par de células com esses candidatos
                        const instanceKey = `${pairCells[0].coordinates.row}-${pairCells[0].coordinates.col}-${pairCells[1].coordinates.row}-${pairCells[1].coordinates.col}-${hiddenCandidates.join(',')}`;


                        // Adiciona a instância à lista se ainda não foi adicionada
                        if (!addedInstances.has(instanceKey)) {
                            hiddenPairInstances.push({ cells: pairCells, candidates: hiddenCandidates });
                            addedInstances.add(instanceKey); // Marca a instância como adicionada
                        }
                    }
                }
            }
        }
    };

    // Check Rows within the universe
    for (let r = 0; r < 9; r++) {
        if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
            checkUnitForHiddenPairs(getUnitCells(board, 'row', r));
        }
    }

    // Check Columns within the universe
    for (let c = 0; c < 9; c++) {
        if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
            checkUnitForHiddenPairs(getUnitCells(board, 'col', c));
        }
    }

    // Check Blocks within the universe
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) { // Block index 0-8
        if (universe.blocks.length === 0 || universe.blocks.includes(blockIndex + 1)) { // Universe blocks are 1-9
            checkUnitForHiddenPairs(getUnitCells(board, 'block', blockIndex));
        }
    }

    // Retorna a lista de instâncias distintas de Pares Ocultos encontradas
    return hiddenPairInstances;
}

/**
 * Encontra Trios Ocultos (Hidden Triples) no tabuleiro dentro das unidades especificadas pelo universo, retornando instâncias.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Uma lista de objetos, onde cada objeto representa uma instância de Trio Oculto com suas células e candidatos.
 */
function findHiddenTriples(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Array<{ cells: Cell[], candidates: number[] }> {
    // Lista para armazenar as instâncias de Trios Ocultos encontradas.
    // Cada item será um objeto { cells: [cell1, cell2, cell3], candidates: [cand1, cand2, cand3] }
    const hiddenTripleInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
    // Usamos um Set para rastrear trios de células (instâncias) já adicionados, para evitar adicionar a mesma instância mais de uma vez.
    // Criamos uma chave única para cada trio de células e candidatos para garantir a unicidade da instância.
    const addedInstances = new Set<string>();


    // Função auxiliar para verificar uma única unidade (linha, coluna ou bloco) por Trios Ocultos
    const checkUnitForHiddenTriples = (unitCells: Cell[]) => {
        // Filtra apenas as células que são vazias (valor null ou 0) e têm candidatos.
        const candidateCellsInUnit = unitCells.filter(cell => (cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.length > 0);

        // Precisamos de pelo menos 3 células candidatas na unidade
        if (candidateCellsInUnit.length < 3) {
            return;
        }

        // Itera por todas as combinações possíveis de 3 candidatos (1 a 9)
        for (let cand1 = 1; cand1 <= 9; cand1++) {
            for (let cand2 = cand1 + 1; cand2 <= 9; cand2++) {
                for (let cand3 = cand2 + 1; cand3 <= 9; cand3++) {

                    // Encontra todas as células candidatas na unidade que contêm pelo menos um desses três candidatos
                    const cellsWithAnyCandidate = candidateCellsInUnit.filter(cell =>
                        cell.candidates.includes(cand1) || cell.candidates.includes(cand2) || cell.candidates.includes(cand3)
                    );

                    // Para ser um Hidden Triple (cand1, cand2, cand3):
                    // Exatamente 3 células candidatas na unidade devem conter pelo menos um desses três candidatos.
                    // E esses três candidatos não devem aparecer como candidatos em NENHUMA outra célula na unidade.
                    // A segunda parte é implicitamente verificada pelo fato de cellsWithAnyCandidate conter APENAS as células
                    // que têm pelo menos um dos candidatos. Se cellsWithAnyCandidate.length === 3, isso significa que
                    // cand1, cand2 e cand3 só aparecem (individualmente ou em combinação) dentro dessas 3 células.

                    if (cellsWithAnyCandidate.length === 3) {
                        // Encontramos uma instância de Hidden Triple para os candidatos (cand1, cand2, cand3) nessas três células!
                        const tripleCells = cellsWithAnyCandidate.sort((a, b) => { // Ordenamos as células por coordenadas para uma chave consistente
                            if (a.coordinates.row !== b.coordinates.row) return a.coordinates.row - b.coordinates.row;
                            return a.coordinates.col - b.coordinates.col;
                        });
                        const hiddenCandidates = [cand1, cand2, cand3].sort((a, b) => a - b); // Os candidatos ocultos (ordenados)

                        // Cria uma chave única para esta instância do trio de células com esses candidatos
                        const instanceKey = `${tripleCells[0].coordinates.row}-${tripleCells[0].coordinates.col}-${tripleCells[1].coordinates.row}-${tripleCells[1].coordinates.col}-${tripleCells[2].coordinates.row}-${tripleCells[2].coordinates.col}-${hiddenCandidates.join(',')}`;


                        // Adiciona a instância à lista se ainda não foi adicionada
                        if (!addedInstances.has(instanceKey)) {
                            hiddenTripleInstances.push({ cells: tripleCells, candidates: hiddenCandidates });
                            addedInstances.add(instanceKey); // Marca a instância como adicionada
                        }
                    }
                }
            }
        }
    };

    // Check Rows within the universe
    for (let r = 0; r < 9; r++) {
        if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
            checkUnitForHiddenTriples(getUnitCells(board, 'row', r));
        }
    }

    // Check Columns within the universe
    for (let c = 0; c < 9; c++) {
        if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
            checkUnitForHiddenTriples(getUnitCells(board, 'col', c));
        }
    }

    // Check Blocks within the universe
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) { // Block index 0-8
        if (universe.blocks.length === 0 || universe.blocks.includes(blockIndex + 1)) { // Universe blocks are 1-9
            checkUnitForHiddenTriples(getUnitCells(board, 'block', blockIndex));
        }
    }

    // Retorna a lista de instâncias distintas de Trios Ocultos encontradas
    return hiddenTripleInstances;
}

/**
 * Encontra X-Wings no tabuleiro dentro das unidades relevantes especificadas pelo universo, agrupados por candidato.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Um Map onde a chave é o candidato do X-Wing e o valor é uma lista de células que formam X-Wings para esse candidato.
 */
function findXWing(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Map<number, Cell[]> {
    // Usamos um Map para agrupar as células dos X-Wings pelo candidato que forma o X-Wing.
    // A chave é o candidato (number) e o valor é uma lista das células (Cell[]) que contêm esse candidato e fazem parte de um X-Wing para ele.
    const xWingsByCandidate: Map<number, Cell[]> = new Map();

    // Contagem de candidatos por linha e coluna, considerando apenas células candidatas
    const candidateCountsByRow: { [key: number]: { [key: number]: number[] } } = {}; // { row: { candidate: [col1, col2, ...] } }
    const candidateCountsByCol: { [key: number]: { [key: number]: number[] } } = {}; // { col: { candidate: [row1, row2, ...] } }

    // Analisa candidatos por linha para linhas dentro do universo especificado
    board.forEach((row, rowIndex) => {
        // Considera apenas linhas dentro do universo ou se nenhum universo de linha for especificado
        if (universe.rows.length === 0 || universe.rows.includes(rowIndex + 1)) {
            row.forEach((cell, colIndex) => {
                // Considera apenas células candidatas (valor é null ou 0)
                if ((cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.length > 0) {
                    cell.candidates.forEach(candidate => {
                        if (!candidateCountsByRow[rowIndex]) {
                            candidateCountsByRow[rowIndex] = {};
                        }
                        if (!candidateCountsByRow[rowIndex][candidate]) {
                            candidateCountsByRow[rowIndex][candidate] = [];
                        }
                        candidateCountsByRow[rowIndex][candidate].push(colIndex);
                    });
                }
            });
        }
    });

    // Identifica X-Wings baseados nas linhas e agrupa as células por candidato
    for (const row1 in candidateCountsByRow) {
        for (const candidateStr in candidateCountsByRow[row1]) {
            const candidate = parseInt(candidateStr); // O candidato que forma o X-Wing
            // Procura por candidatos que aparecem em exatamente 2 posições na linha row1
            if (candidateCountsByRow[row1][candidateStr].length === 2) {
                const cols1 = candidateCountsByRow[row1][candidateStr]; // As duas colunas na linha row1

                // Procura por outra linha (row2) que também está no universo (ou sem universo de linha)
                // e tem o mesmo candidato nas mesmas duas colunas.
                for (const row2 in candidateCountsByRow) {
                    // Garante que row2 é diferente de row1 e está dentro do universo (se especificado)
                    if (parseInt(row2) > parseInt(row1) && (universe.rows.length === 0 || universe.rows.includes(parseInt(row2) + 1)) && candidateCountsByRow[row2] && candidateCountsByRow[row2][candidateStr]?.length === 2) {
                        const cols2 = candidateCountsByRow[row2][candidateStr]; // As duas colunas na linha row2

                        // Verifica se os índices das colunas são os mesmos para ambas as linhas
                        if (cols1[0] === cols2[0] && cols1[1] === cols2[1]) {
                            // Encontramos um X-Wing baseado em linha para este candidato!
                            const row1Index = parseInt(row1);
                            const row2Index = parseInt(row2);
                            const col1Index = cols1[0];
                            const col2Index = cols1[1];

                            // As 4 células que formam esta instância de X-Wing
                            const xWingCells = [
                                board[row1Index][col1Index],
                                board[row1Index][col2Index],
                                board[row2Index][col1Index],
                                board[row2Index][col2Index],
                            ];

                            // Adiciona estas células ao mapa, agrupadas pelo candidato do X-Wing.
                            // Se o candidato ainda não estiver no mapa, cria uma nova entrada com uma lista vazia.
                            if (!xWingsByCandidate.has(candidate)) {
                                xWingsByCandidate.set(candidate, []);
                            }
                            const cellsForThisCandidate = xWingsByCandidate.get(candidate)!;

                            // Adiciona cada célula do X-Wing à lista para este candidato, evitando duplicatas DENTRO desta lista.
                            xWingCells.forEach(cell => {
                                if (!cellsForThisCandidate.includes(cell)) {
                                    cellsForThisCandidate.push(cell);
                                }
                            });
                        }
                    }
                }
            }
        }
    }


    // Analisa candidatos por coluna para colunas dentro do universo especificado (simétrico à verificação de linha)
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            // Considera apenas colunas dentro do universo ou se nenhum universo de coluna for especificado
            if (universe.cols.length === 0 || universe.cols.includes(colIndex + 1)) {
                // Considera apenas células candidatas (valor é null ou 0)
                if ((cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.length > 0) {
                    cell.candidates.forEach(candidate => {
                        if (!candidateCountsByCol[colIndex]) {
                            candidateCountsByCol[colIndex] = {};
                        }
                        if (!candidateCountsByCol[colIndex][candidate]) {
                            candidateCountsByCol[colIndex][candidate] = [];
                        }
                        candidateCountsByCol[colIndex][candidate].push(rowIndex);
                    });
                }
            }
        });
    });


    // Identifica X-Wings baseados nas colunas e agrupa as células por candidato
    for (const col1 in candidateCountsByCol) {
        for (const candidateStr in candidateCountsByCol[col1]) {
            const candidate = parseInt(candidateStr); // O candidato que forma o X-Wing
            // Procura por candidatos que aparecem em exatamente 2 posições na coluna col1
            if (candidateCountsByCol[col1][candidateStr].length === 2) {
                const rows1 = candidateCountsByCol[col1][candidateStr]; // As duas linhas na coluna col1

                // Procura por outra coluna (col2) que também está no universo (ou sem universo de coluna)
                // e tem o mesmo candidato nas mesmas duas linhas.
                for (const col2 in candidateCountsByCol) {
                    // Garante que col2 é diferente de col1 e está dentro do universo (se especificado)
                    if (parseInt(col2) > parseInt(col1) && (universe.cols.length === 0 || universe.cols.includes(parseInt(col2) + 1)) && candidateCountsByCol[col2] && candidateCountsByCol[col2][candidateStr]?.length === 2) {
                        const rows2 = candidateCountsByCol[col2][candidateStr]; // As duas linhas na coluna col2

                        // Verifica se os índices das linhas são os mesmos para ambas as colunas
                        if (rows1[0] === rows2[0] && rows1[1] === rows2[1]) {
                            // Encontramos um X-Wing baseado em coluna para este candidato!
                            const col1Index = parseInt(col1);
                            const col2Index = parseInt(col2);
                            const row1Index = rows1[0];
                            const row2Index = rows1[1];

                            // As 4 células que formam esta instância de X-Wing
                            const xWingCells = [
                                board[row1Index][col1Index],
                                board[row2Index][col1Index],
                                board[row1Index][col2Index],
                                board[row2Index][col2Index],
                            ];

                            // Adiciona estas células ao mapa, agrupadas pelo candidato do X-Wing.
                            // Se o candidato ainda não estiver no mapa, cria uma nova entrada com uma lista vazia.
                            if (!xWingsByCandidate.has(candidate)) {
                                xWingsByCandidate.set(candidate, []);
                            }
                            const cellsForThisCandidate = xWingsByCandidate.get(candidate)!;

                            // Adiciona cada célula do X-Wing à lista para este candidato, evitando duplicatas DENTRO desta lista.
                            xWingCells.forEach(cell => {
                                if (!cellsForThisCandidate.includes(cell)) {
                                    cellsForThisCandidate.push(cell);
                                }
                            });
                        }
                    }
                }
            }
        }
    }

    // Retorna o Map onde as chaves são os candidatos do X-Wing e os valores são arrays de células envolvidas para CADA candidato.
    // Note que se houver múltiplos X-Wings para o mesmo candidato, todas as células envolvidas estarão na mesma lista para aquele candidato.
    return xWingsByCandidate;
}

/**
 * Encontra Swordfish no tabuleiro dentro das unidades relevantes especificadas pelo universo, agrupados por candidato.
 * @param board O tabuleiro Sudoku.
 * @param universe O objeto universo contendo as restrições de linhas, colunas e blocos.
 * @returns Um Map onde a chave é o candidato do Swordfish e o valor é uma lista de células que formam Swordfish para esse candidato.
 */
function findSwordfish(board: Cell[][], universe: { rows: number[]; cols: number[]; blocks: number[] }): Map<number, Cell[]> {
    // Usamos um Map para agrupar as células do Swordfish pelo candidato que forma o Swordfish.
    const swordfishByCandidate: Map<number, Cell[]> = new Map();

    // Itera por cada número candidato (de 1 a 9) para procurar Swordfish para este candidato
    for (let candidate = 1; candidate <= 9; candidate++) {

        // --- Verifica por Swordfish baseado em Linha ---
        // Encontra as linhas onde o candidato aparece em exatamente 2 ou 3 células candidatas,
        // considerando apenas as linhas dentro do universo especificado.
        const rowsWithCandidateIn2or3Positions: { rowIndex: number; cols: number[] }[] = [];
        for (let r = 0; r < 9; r++) {
            if (universe.rows.length === 0 || universe.rows.includes(r + 1)) {
                const cellsWithCandidateInRow = board[r].filter(cell =>
                    (cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.includes(candidate)
                );
                if (cellsWithCandidateInRow.length >= 2 && cellsWithCandidateInRow.length <= 3) {
                    rowsWithCandidateIn2or3Positions.push({
                        rowIndex: r,
                        cols: cellsWithCandidateInRow.map(cell => cell.coordinates.col)
                    });
                }
            }
        }

        // Precisamos de pelo menos 3 dessas linhas para potencialmente formar um Swordfish
        if (rowsWithCandidateIn2or3Positions.length >= 3) {
            // Procura por combinações de 3 dessas linhas
            for (let i = 0; i < rowsWithCandidateIn2or3Positions.length; i++) {
                const rowInfo1 = rowsWithCandidateIn2or3Positions[i];
                for (let j = i + 1; j < rowsWithCandidateIn2or3Positions.length; j++) {
                    const rowInfo2 = rowsWithCandidateIn2or3Positions[j];
                    for (let k = j + 1; k < rowsWithCandidateIn2or3Positions.length; k++) {
                        const rowInfo3 = rowsWithCandidateIn2or3Positions[k];

                        // Coleta todos os índices de coluna únicos dessas três linhas onde o candidato aparece
                        const uniqueCols = new Set<number>();
                        rowInfo1.cols.forEach(col => uniqueCols.add(col));
                        rowInfo2.cols.forEach(col => uniqueCols.add(col));
                        rowInfo3.cols.forEach(col => uniqueCols.add(col));

                        // Se o número de colunas únicas for EXATAMENTE 3, encontramos um Swordfish baseado em linha!
                        if (uniqueCols.size === 3) {
                            const swordfishCandidate = candidate; // O candidato do Swordfish
                            const swordfishRows = [rowInfo1.rowIndex, rowInfo2.rowIndex, rowInfo3.rowIndex]; // As linhas base
                            const swordfishCols = Array.from(uniqueCols).sort((a, b) => a - b); // As colunas de cobertura (ordenadas)

                            // Adiciona as células que formam o Swordfish ao mapa, agrupadas pelo candidato do Swordfish.
                            // Se o candidato ainda não estiver no mapa, cria uma nova entrada.
                            if (!swordfishByCandidate.has(swordfishCandidate)) {
                                swordfishByCandidate.set(swordfishCandidate, []);
                            }
                            const cellsForThisCandidate = swordfishByCandidate.get(swordfishCandidate)!;

                            // Adiciona cada célula do Swordfish à lista para este candidato, evitando duplicatas.
                            swordfishRows.forEach(rIndex => {
                                swordfishCols.forEach(cIndex => {
                                    const cell = board[rIndex][cIndex];
                                    // Garante que a célula é uma célula candidata e contém o candidato do Swordfish
                                    if ((cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.includes(swordfishCandidate)) {
                                        if (!cellsForThisCandidate.includes(cell)) {
                                            cellsForThisCandidate.push(cell);
                                        }
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }


        // --- Verifica por Swordfish baseado em Coluna (simétrico) ---
        const colsWithCandidateIn2or3Positions: { colIndex: number; rows: number[] }[] = [];
        for (let c = 0; c < 9; c++) {
            if (universe.cols.length === 0 || universe.cols.includes(c + 1)) {
                const cellsWithCandidateInCol = board.map(row => row[c]).filter(cell =>
                    (cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.includes(candidate)
                );
                if (cellsWithCandidateInCol.length >= 2 && cellsWithCandidateInCol.length <= 3) {
                    colsWithCandidateIn2or3Positions.push({
                        colIndex: c,
                        rows: cellsWithCandidateInCol.map(cell => cell.coordinates.row)
                    });
                }
            }
        }

        if (colsWithCandidateIn2or3Positions.length >= 3) {
            for (let i = 0; i < colsWithCandidateIn2or3Positions.length; i++) {
                const colInfo1 = colsWithCandidateIn2or3Positions[i];
                for (let j = i + 1; j < colsWithCandidateIn2or3Positions.length; j++) {
                    const colInfo2 = colsWithCandidateIn2or3Positions[j];
                    for (let k = j + 1; k < colsWithCandidateIn2or3Positions.length; k++) {
                        const colInfo3 = colsWithCandidateIn2or3Positions[k];

                        const uniqueRows = new Set<number>();
                        colInfo1.rows.forEach(row => uniqueRows.add(row));
                        colInfo2.rows.forEach(row => uniqueRows.add(row));
                        colInfo3.rows.forEach(row => uniqueRows.add(row));

                        if (uniqueRows.size === 3) {
                            // Encontramos um Swordfish baseado em coluna para 'candidate'
                            const swordfishCandidate = candidate;
                            const swordfishCols = [colInfo1.colIndex, colInfo2.colIndex, colInfo3.colIndex];
                            const swordfishRows = Array.from(uniqueRows).sort((a, b) => a - b);

                            // Adiciona as células que formam o Swordfish ao mapa, agrupadas pelo candidato.
                            if (!swordfishByCandidate.has(swordfishCandidate)) {
                                swordfishByCandidate.set(swordfishCandidate, []);
                            }
                            const cellsForThisCandidate = swordfishByCandidate.get(swordfishCandidate)!;

                            swordfishRows.forEach(rIndex => {
                                swordfishCols.forEach(cIndex => {
                                    const cell = board[rIndex][cIndex];
                                    if ((cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.includes(swordfishCandidate)) {
                                        if (!cellsForThisCandidate.includes(cell)) {
                                            cellsForThisCandidate.push(cell);
                                        }
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }
    }

    // Retorna o Map onde as chaves são os candidatos do Swordfish e os valores são arrays de células envolvidas para CADA candidato.
    return swordfishByCandidate;
}

function countCandidates(cell: any, count: number): boolean {
    if (cell.value) return false;
    return cell.candidates.length === count;
}

function getBlockNumber(row: number, col: number): number {
    const blockRow = Math.floor(row / 3);
    const blockCol = Math.floor(col / 3);
    return blockRow * 3 + blockCol + 1;
}

// function filterCandidates() {
//     // Clear all previous highlights
//     board.value.forEach(row => {
//         row.forEach(cell => {
//             cell.highlight = false;
//             cell.candidateColors = undefined; // Clear the new candidate colors map
//         });
//     });

//     const query = searchQuery.value.trim();
//     if (!query) {
//         highlightedCells.value = [];
//         return;
//     }

//     let universe: { rows: number[]; cols: number[]; blocks: number[] } = { rows: [], cols: [], blocks: [] };
//     let filterCommands: string = query;

//     const universeMatch = query.match(/^(blocks?|b|lines?|l|columns?|column?|c)\((.*?)\)\s+(.*)$/i);
//     if (universeMatch) {
//         const universeType = universeMatch[1].toLowerCase();
//         const universeArgs = universeMatch[2].split(',').map(arg => parseInt(arg.trim())).filter(arg => !isNaN(arg));
//         filterCommands = universeMatch[3];

//         if (['line', 'lines', 'l'].includes(universeType)) universe.rows = universeArgs;
//         else if (['col', 'cols', 'column', 'columns', 'c'].includes(universeType)) universe.cols = universeArgs;
//         else if (['block', 'blocks', 'b'].includes(universeType)) universe.blocks = universeArgs;
//     }

//     // Collection for general cell highlighting
//     const cellsForGeneralHighlight: Set<Cell> = new Set();

//     // Map to store candidate colors for each cell: Cell -> (Candidate -> Color)
//     const cellCandidateColors: Map<Cell, Map<number, string>> = new Map();

//     // Predefined list of highlight colors
//     const highlightColors = ['#FF0000', '#0000FF', '#00FF00', '#A020F0', '#FFA500']; // Red, Blue, Green, Purple, Orange
//     let colorIndex = 0; // Index to cycle through colors

//     const commands = filterCommands.split('&&').map(cmd => cmd.trim());

//     commands.forEach(command => {
//         const match = command.match(/(\w+)\((.*?)\)/i);
//         if (match) {
//             const operation = match[1].toLowerCase();
//             const argsString = match[2];
//             const args = argsString.split(',').map(arg => parseInt(arg.trim())).filter(arg => !isNaN(arg));

//             // Get the color for this command's highlights
//             const currentHighlightColor = highlightColors[colorIndex % highlightColors.length];
//             colorIndex++; // Move to the next color for the next command

//             // --- Handle filters that result in CANDIDATE highlighting ---
//             if (['contains', 'only', 'unique', 'nakedpairs', 'nakedtriples', 'hiddenpairs', 'hiddentriples', 'xwing', 'swordfish'].includes(operation)) {
//                 let results: Array<{ cell: Cell, candidates: number[] }> = []; // Results still in old format

//                 // Cell-by-cell filters need custom logic to find candidates and populate results
//                 if (['contains', 'only'].includes(operation)) {
//                     board.value.forEach(row => {
//                         row.forEach(cell => {
//                             const isCellInUniverse = // Check if the cell is in the universe
//                                 (universe.rows.length === 0 || universe.rows.includes(cell.coordinates.row + 1)) &&
//                                 (universe.cols.length === 0 || universe.cols.includes(cell.coordinates.col + 1)) &&
//                                 (universe.blocks.length === 0 || universe.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col)));

//                             if (isCellInUniverse && (cell.value === null || cell.value === 0) && cell.candidates) {
//                                 let candidatesToHighlight: number[] = [];
//                                 switch (operation) {
//                                     case 'contains':
//                                         candidatesToHighlight = cell.candidates.filter(cand => args.includes(cand));
//                                         break;
//                                     case 'only':
//                                         if (only(cell, args)) {
//                                             candidatesToHighlight = cell.candidates;
//                                         }
//                                         break;
//                                 }
//                                 if (candidatesToHighlight.length > 0) {
//                                     results.push({ cell: cell, candidates: candidatesToHighlight });
//                                 }
//                             }
//                         });
//                     });
//                 } else {
//                     // Unit-scanning filters (find... functions) that return Array<{ cell: Cell, candidates: number[] }>
//                     switch (operation) {
//                         case 'unique': results = findUniqueCandidates(board.value, universe); break;
//                         case 'nakedpairs': results = findNakedPairs(board.value, universe); break;
//                         case 'nakedtriples': results = findNakedTriples(board.value, universe); break;
//                         case 'hiddenpairs': results = findHiddenPairs(board.value, universe); break;
//                         case 'hiddentriples': results = findHiddenTriples(board.value, universe); break;
//                         case 'xwing': results = findXWing(board.value, universe); break;
//                         case 'swordfish': results = findSwordfish(board.value, universe); break;
//                     }
//                 }


//                 // Apply the collected candidate highlights with the current color
//                 results.forEach(item => {
//                     if (!cellCandidateColors.has(item.cell)) {
//                         cellCandidateColors.set(item.cell, new Map());
//                     }
//                     const candidateMap = cellCandidateColors.get(item.cell)!;
//                     item.candidates.forEach(cand => {
//                         // Assign the current color to this candidate in this cell.
//                         // If a candidate is highlighted by multiple filters, the last color assigned wins.
//                         candidateMap.set(cand, currentHighlightColor);
//                     });
//                 });

//             }
//             // --- Lida com filtros que resultam em DESTAQUE GERAL DA CÉLULA ---
//             else if (['notcontains', 'count'].includes(operation)) {
//                 board.value.forEach(row => {
//                     row.forEach(cell => {
//                         const isCellInUniverse = // Check if the cell is in the universe
//                             (universe.rows.length === 0 || universe.rows.includes(cell.coordinates.row + 1)) &&
//                             (universe.cols.length === 0 || universe.cols.includes(cell.coordinates.col + 1)) &&
//                             (universe.blocks.length === 0 || universe.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col)));

//                         if (isCellInUniverse) {
//                             let shouldHighlightCell = false;
//                             switch (operation) {
//                                 case 'notcontains':
//                                     if ((cell.value === null || cell.value === 0) && cell.candidates) {
//                                         shouldHighlightCell = !cell.candidates.some(cand => args.includes(cand));
//                                     } else if (cell.value !== null && cell.value !== 0) {
//                                         shouldHighlightCell = !args.includes(cell.value);
//                                     }
//                                     break;
//                                 case 'count':
//                                     if (args.length === 1 && (cell.value === null || cell.value === 0) && cell.candidates) {
//                                         shouldHighlightCell = cell.candidates.length === args[0];
//                                     }
//                                     break;
//                             }
//                             // If the cell should be highlighted generally, add to the set
//                             if (shouldHighlightCell && !cellsForGeneralHighlight.has(cell)) {
//                                 cellsForGeneralHighlight.add(cell);
//                             }
//                         }
//                     });
//                 });
//             }
//             // Add other operation types that might highlight the cell generally here
//         } else if (!isNaN(parseInt(command.trim()))) {
//             // Single number filter (e.g., "5")
//             const number = parseInt(command.trim());
//             // Get the color for this command's highlights
//             const currentHighlightColor = highlightColors[colorIndex % highlightColors.length];
//             colorIndex++; // Move to the next color

//             board.value.forEach(row => {
//                 row.forEach(cell => {
//                     const isCellInUniverse = // Check if the cell is in the universe
//                         (universe.rows.length === 0 || universe.rows.includes(cell.coordinates.row + 1)) &&
//                         (universe.cols.length === 0 || universe.cols.includes(cell.coordinates.col + 1)) &&
//                         (universe.blocks.length === 0 || universe.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col)));

//                     if (isCellInUniverse) {
//                         // If cell contains the number as a candidate, highlight that candidate with the current color
//                         if ((cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.includes(number)) {
//                             if (!cellCandidateColors.has(cell)) {
//                                 cellCandidateColors.set(cell, new Map());
//                             }
//                             cellCandidateColors.get(cell)!.set(number, currentHighlightColor);
//                         } else if (cell.value !== null && cell.value !== 0 && cell.value === number) {
//                             // If it's a filled cell with the number, highlight the cell itself generally
//                             if (!cellsForGeneralHighlight.has(cell)) {
//                                 cellsForGeneralHighlight.add(cell);
//                             }
//                         }
//                     }
//                 });
//             });
//         }
//         // Commands that don't match any expected filter operation are ignored.
//     });

//     // --- Apply the Collected Highlights ---

//     // Apply the collected candidate colors to the cells
//     cellCandidateColors.forEach((candidateMap, cell) => {
//         cell.candidateColors = candidateMap; // Assign the Map to the cell property
//     });

//     // Apply the collected general cell highlights
//     cellsForGeneralHighlight.forEach(cell => {
//         cell.highlight = true;
//     });

//     // Update highlightedCells ref to include all cells that have ANY type of highlight
//     highlightedCells.value = board.value.flat().filter(cell => cell.highlight || (cell.candidateColors && cell.candidateColors.size > 0));

// }

function filterCandidates() {
    // Limpa todos os destaques anteriores (candidatos e geral)
    board.value.forEach(row => {
        row.forEach(cell => {
            cell.highlight = false;
            cell.candidateColors = undefined; // Limpa o mapa de cores de candidatos
        });
    });

    const query = searchQuery.value.trim();
    if (!query) {
        highlightedCells.value = [];
        return;
    }

    let universe: { rows: number[]; cols: number[]; blocks: number[] } = { rows: [], cols: [], blocks: [] };
    let filterCommands: string = query;

    const universeMatch = query.match(/^(blocks?|b|lines?|l|columns?|column?|c)\((.*?)\)\s+(.*)$/i);
    if (universeMatch) {
        const universeType = universeMatch[1].toLowerCase();
        const universeArgs = universeMatch[2].split(',').map(arg => parseInt(arg.trim())).filter(arg => !isNaN(arg));
        filterCommands = universeMatch[3];

        if (['line', 'lines', 'l'].includes(universeType)) universe.rows = universeArgs;
        else if (['col', 'cols', 'column', 'columns', 'c'].includes(universeType)) universe.cols = universeArgs;
        else if (['block', 'blocks', 'b'].includes(universeType)) universe.blocks = universeArgs;
    }

    const cellsForGeneralHighlight: Set<Cell> = new Set();
    // Mapa para armazenar as cores dos candidatos: Cell -> (Candidato -> Cor)
    const cellCandidateColors: Map<Cell, Map<number, string>> = new Map();

    // Lista de cores para destacar
    const highlightColors = ['#FF0000', '#0000FF', '#00FF00', '#A020F0', '#FFA500', '#FF4500', '#8A2BE2', '#32CD32', '#4169E1']; // Mais cores
    let colorIndex = 0; // Índice para ciclar pelas cores

    const commands = filterCommands.split('&&').map(cmd => cmd.trim());

    commands.forEach(command => {
        const match = command.match(/(\w+)\((.*?)\)/i);
        if (match) {
            const operation = match[1].toLowerCase();
            const argsString = match[2];
            const args = argsString.split(',').map(arg => parseInt(arg.trim())).filter(arg => !isNaN(arg));


            // --- Lida com filtros que retornam Array<{ cell: Cell, candidates: number[] }> (Unique, Contains, Only) ---
            // Estes filtros recebem uma cor por COMANDO. Unique retorna células com seus candidatos únicos.
            // Contains e Only identificam candidatos em células específicas.
            if (['contains', 'only', 'unique'].includes(operation)) {
                let results: Array<{ cell: Cell, candidates: number[] }> = [];

                // Lógica para Contains e Only (filtros célula a célula)
                if (['contains', 'only'].includes(operation)) {
                    board.value.forEach(row => {
                        row.forEach(cell => {
                            const isCellInUniverse = // Verifica se a célula está no universo
                                (universe.rows.length === 0 || universe.rows.includes(cell.coordinates.row + 1)) &&
                                (universe.cols.length === 0 || universe.cols.includes(cell.coordinates.col + 1)) &&
                                (universe.blocks.length === 0 || universe.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col)));

                            if (isCellInUniverse && (cell.value === null || cell.value === 0) && cell.candidates) {
                                let candidatesToHighlight: number[] = [];
                                switch (operation) {
                                    case 'contains':
                                        candidatesToHighlight = cell.candidates.filter(cand => args.includes(cand));
                                        break;
                                    case 'only':
                                        if (only(cell, args)) {
                                            candidatesToHighlight = cell.candidates;
                                        }
                                        break;
                                }
                                if (candidatesToHighlight.length > 0) {
                                    results.push({ cell: cell, candidates: candidatesToHighlight });
                                }
                            }
                        });
                    });
                } else { // Caso 'unique'
                    results = findUniqueCandidates(board.value, universe); // Assume retorna Array<{cell, candidates}>
                }

                // Atribui uma ÚNICA cor para todos os resultados deste comando
                const commandColor = highlightColors[colorIndex % highlightColors.length];
                colorIndex++; // Incrementa o índice de cor para o PRÓXIMO comando

                results.forEach(item => {
                    if (!cellCandidateColors.has(item.cell)) {
                        cellCandidateColors.set(item.cell, new Map());
                    }
                    const candidateMap = cellCandidateColors.get(item.cell)!;
                    item.candidates.forEach(cand => {
                        // Atribui a cor do comando a cada candidato relevante nesta célula
                        candidateMap.set(cand, commandColor);
                    });
                });

            }
            // --- Lida com Naked/Hidden Pairs e Triples (que agora retornam Array<{ cells: Cell[], candidates: number[] }>) ---
            // Estes filtros receberão uma cor POR INSTÂNCIA do padrão.
            else if (['nakedpairs', 'nakedtriples', 'hiddenpairs', 'hiddentriples'].includes(operation)) {
                let patternInstances: Array<{ cells: Cell[], candidates: number[] }> = [];
                switch (operation) {
                    case 'nakedpairs': patternInstances = findNakedPairs(board.value, universe); break; // Assume retorna Array<{cells, candidates}>
                    case 'nakedtriples': patternInstances = findNakedTriples(board.value, universe); break; // Assume retorna Array<{cells, candidates}>
                    case 'hiddenpairs': patternInstances = findHiddenPairs(board.value, universe); break; // Assume retorna Array<{cells, candidates}>
                    case 'hiddentriples': patternInstances = findHiddenTriples(board.value, universe); break; // Assume retorna Array<{cells, candidates}>
                }

                // Itera por CADA INSTÂNCIA distinta do padrão encontrada por este comando
                patternInstances.forEach(instance => {
                    // Atribui uma NOVA cor para ESTA instância específica do padrão
                    const instanceColor = highlightColors[colorIndex % highlightColors.length];
                    colorIndex++; // Incrementa o índice de cor para a PRÓXIMA instância

                    // Para cada célula envolvida nesta instância do padrão
                    instance.cells.forEach(cell => {
                        // Para cada candidato relevante para esta instância (geralmente 2 ou 3 candidatos do par/trio)
                        instance.candidates.forEach(candidate => {
                            // Aplica o destaque apenas se a célula for uma célula candidata e realmente contiver este candidato
                            if ((cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.includes(candidate)) {
                                if (!cellCandidateColors.has(cell)) {
                                    cellCandidateColors.set(cell, new Map());
                                }
                                // Atribui a cor DESSA INSTÂNCIA a este candidato NESTA célula
                                cellCandidateColors.get(cell)!.set(candidate, instanceColor);
                            }
                        });
                    });
                });

            }
            // --- Lida com XWing e Swordfish (que retornam Map<number, Cell[]>) ---
            // Estes filtros recebem uma cor POR GRUPO DE CANDIDATO que forma o padrão.
            else if (['xwing', 'swordfish'].includes(operation)) {
                let groupedResults: Map<number, Cell[]> = new Map();
                switch (operation) {
                    case 'xwing': groupedResults = findXWing(board.value, universe); break; // findXWing retorna Map<number, Cell[]>
                    case 'swordfish': groupedResults = findSwordfish(board.value, universe); break; // findSwordfish retorna Map<number, Cell[]>
                }

                // Itera pelos resultados agrupados por candidato.
                // CADA grupo de candidato (candidato específico) DENTRO deste comando receberá uma NOVA cor.
                groupedResults.forEach((cellsInPattern, candidate) => {
                    // Pega a próxima cor DISPONÍVEL para este grupo de padrão (candidato específico)
                    const candidatePatternColor = highlightColors[colorIndex % highlightColors.length];
                    colorIndex++; // Incrementa o índice de cor para o PRÓXIMO grupo de padrão/candidato

                    // Para cada célula envolvida no padrão para este candidato
                    cellsInPattern.forEach(cell => {
                        // Aplica o destaque apenas se for uma célula candidata e contiver o candidato relevante
                        if ((cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.includes(candidate)) {
                            if (!cellCandidateColors.has(cell)) {
                                cellCandidateColors.set(cell, new Map());
                            }
                            // Atribui a cor específica deste grupo de padrão (candidato) a este candidato nesta célula
                            cellCandidateColors.get(cell)!.set(candidate, candidatePatternColor);
                        }
                    });
                });
            }
            // --- Lida com filtros que resultam em DESTAQUE GERAL DA CÉLULA ---
            else if (['notcontains', 'count'].includes(operation)) {
                board.value.forEach(row => {
                    row.forEach(cell => {
                        const isCellInUniverse = // Verifica se a célula está no universo
                            (universe.rows.length === 0 || universe.rows.includes(cell.coordinates.row + 1)) &&
                            (universe.cols.length === 0 || universe.cols.includes(cell.coordinates.col + 1)) &&
                            (universe.blocks.length === 0 || universe.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col)));

                        if (isCellInUniverse) {
                            let shouldHighlightCell = false;
                            switch (operation) {
                                case 'notcontains':
                                    if ((cell.value === null || cell.value === 0) && cell.candidates) {
                                        shouldHighlightCell = !cell.candidates.some(cand => args.includes(cand));
                                    } else if (cell.value !== null && cell.value !== 0) {
                                        shouldHighlightCell = !args.includes(cell.value);
                                    }
                                    break;
                                case 'count':
                                    if (args.length === 1 && (cell.value === null || cell.value === 0) && cell.candidates) {
                                        shouldHighlightCell = cell.candidates.length === args[0];
                                    }
                                    break;
                            }
                            if (shouldHighlightCell && !cellsForGeneralHighlight.has(cell)) {
                                cellsForGeneralHighlight.add(cell);
                            }
                        }
                    });
                });
            }
            // Adicione outros tipos de operação que podem destacar a célula inteira aqui.

        } else if (!isNaN(parseInt(command.trim()))) {
            // Caso especial: o comando é apenas um número (e.g., "5").
            // Destaca candidatos com uma cor, e células preenchidas com destaque geral.
            const number = parseInt(command.trim());
            // Pega a cor para este filtro de número único
            const filterNumberColor = highlightColors[colorIndex % highlightColors.length];
            colorIndex++; // Incrementa o índice de cor

            board.value.forEach(row => {
                row.forEach(cell => {
                    const isCellInUniverse = // Verifica se a célula está no universo
                        (universe.rows.length === 0 || universe.rows.includes(cell.coordinates.row + 1)) &&
                        (universe.cols.length === 0 || universe.cols.includes(cell.coordinates.col + 1)) &&
                        (universe.blocks.length === 0 || universe.blocks.includes(getBlockNumber(cell.coordinates.row, cell.coordinates.col)));

                    if (isCellInUniverse) {
                        // Se for uma célula candidata e contiver o número, destaca o candidato com sua cor.
                        if ((cell.value === null || cell.value === 0) && cell.candidates && cell.candidates.includes(number)) {
                            if (!cellCandidateColors.has(cell)) {
                                cellCandidateColors.set(cell, new Map());
                            }
                            cellCandidateColors.get(cell)!.set(number, filterNumberColor);
                        } else if (cell.value !== null && cell.value !== 0 && cell.value === number) {
                            // Se for uma célula preenchida com o número, destaca a célula inteira.
                            if (!cellsForGeneralHighlight.has(cell)) {
                                cellsForGeneralHighlight.add(cell);
                            }
                        }
                    }
                });
            });
        }
        // Comandos que não se encaixam nos formatos esperados são simplesmente ignorados.
    });

    // --- Aplicar os Destaques Coletados ---

    // Aplica as cores de candidatos coletadas à propriedade candidateColors das células
    cellCandidateColors.forEach((candidateMap, cell) => {
        // Cria um novo Map a partir do Set de pares candidato->cor e atribui à célula
        cell.candidateColors = new Map(candidateMap);
    });

    // Aplica o destaque geral (cell.highlight = true) às células coletadas
    cellsForGeneralHighlight.forEach(cell => {
        cell.highlight = true;
    });

    // Atualiza o ref highlightedCells para incluir todas as células que têm QUALQUER tipo de destaque
    highlightedCells.value = board.value.flat().filter(cell => cell.highlight || (cell.candidateColors && cell.candidateColors.size > 0));

}

watch(board, () => {
    filterCandidates(); // Refiltrar quando o board mudar (e.g., novo jogo)
});

watch(searchQuery, () => {
    filterCandidates(); // Refiltrar quando a query mudar
});

</script>

<style lang="css" scoped>
.grid3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.writing-tools-top {
    width: 100%;
    float: right;
    padding-bottom: 5px;
    display: none;
}

.writing-tools-top .v-btn-toggle {
    margin: 0;
    padding: 0;
    height: 1.75em;
    border: 1px solid #ccc;
}

#game-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 98vw;
    max-width: 18cm;
    box-sizing: border-box;
    /* Ensure padding doesn't affect the overall width */
}

#play-button {
    height: 2em;
    font-size: 1.2em;
    cursor: pointer;
    border: solid 2px black;
    margin-left: 5px;
    padding: 0 5px;
}

#gameMode {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

#gameMode label {
    margin: 0 8px;
}

#hearts {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.heart {
    color: red;
    font-size: 1.2em;
    margin: 0 3px;
}

#board {
    width: 98vw;
    max-width: 18cm;
    margin: 5px auto 20px auto;
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(9, 1fr);
    aspect-ratio: 1 / 1;
    /* Maintain a square aspect ratio */
}

.block {
    border: solid 2px black;
    z-index: 3;
    grid-column-span: 3;
    grid-row-span: 3;
}

/* Target the correct blocks based on their position in the 9x9 grid */
#board>div:nth-child(1) {
    grid-column: 1 / span 3;
    grid-row: 1 / span 3;
}

#board>div:nth-child(2) {
    grid-column: 4 / span 3;
    grid-row: 1 / span 3;
}

#board>div:nth-child(3) {
    grid-column: 7 / span 3;
    grid-row: 1 / span 3;
}

#board>div:nth-child(4) {
    grid-column: 1 / span 3;
    grid-row: 4 / span 3;
}

#board>div:nth-child(5) {
    grid-column: 4 / span 3;
    grid-row: 4 / span 3;
}

#board>div:nth-child(6) {
    grid-column: 7 / span 3;
    grid-row: 4 / span 3;
}

#board>div:nth-child(7) {
    grid-column: 1 / span 3;
    grid-row: 7 / span 3;
}

#board>div:nth-child(8) {
    grid-column: 4 / span 3;
    grid-row: 7 / span 3;
}

#board>div:nth-child(9) {
    grid-column: 7 / span 3;
    grid-row: 7 / span 3;
}

/* Ensure cells have borders */
#board>div>div {
    border: solid 1px gray;
    border-collapse: collapse;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    /* Maintain square cells */
}

#gameMode {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

#hearts {
    margin-left: 15px;
}

#actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
    padding: 10px;
}

#numbers {
    width: 8cm;
    margin: 15px auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
}

.number {
    font-size: 1em;
    border-radius: 5px;
    border: solid 1px gray;
    background-color: lightgray;
    font-weight: bolder;
    justify-content: center;
}

.eraser {
    font-weight: normal !important;
    width: 8cm;
    margin: 15px auto;
}

.number:disabled {
    background-color: gray;
    cursor: not-allowed;
}

.selected {
    border: 2px solid black;
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

.new-game {
    width: 100%;
    margin: 0 10px 0 10px;
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

.difficulty-button {
    width: 80%;
    margin: 0 auto;
    margin-bottom: 10px;
}

.no-select {
    -webkit-user-select: none;
    /* Safari */
    -moz-user-select: none;
    /* Firefox */
    -ms-user-select: none;
    /* IE/Edge */
    user-select: none;
    /* Standard */
}

#clearCellButton {
    margin: 10px auto;
    display: block;
    width: 50%;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: bold;
    border-radius: 5px;
    border: solid 1px gray;
    background-color: lightgray;
}

.v-dialog {
    width: 500px !important;
    max-width: 500px !important;
    margin: 0 auto;
    /* Center dialogs */
}

@media (min-width: 1000px) {

    #board,
    #game-header {
        width: 18cm;
        max-width: none;
    }
}

@media (min-width: 769px) and (max-width: 999px) {

    #board,
    #game-header {
        width: 98vw;
    }
}

/* Media query for smaller screens (e.g., phones) */
@media (max-width: 768px) {
    body {
        flex-direction: column;
        align-items: center;
    }

    #board,
    #game-header {
        width: 90vw;
        margin: 10px auto;
    }

    .block {
        border: solid 1px black;
    }

    #board>div>div {
        border: solid 1px lightgray;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1 / 1;
        font-size: 1em;
    }

    #title-play {
        display: flex;
        /* Manter título e botão na mesma linha */
        align-items: center;
        /* Alinhar verticalmente */
        margin-bottom: 10px;
    }

    #title-play h1 {
        font-size: 1.8em;
        /* Reduzir um pouco o tamanho do título em telas menores */
        margin-right: 5px;
        /* Adicionar um pouco de espaço entre o título e o botão */
    }

    #game-header {
        margin-bottom: -1.5em;
    }

    #gameMode label {
        margin: 0 8px;
        font-size: 0.9em;
    }

    #hearts {
        margin-top: 5px;
    }

    .heart {
        font-size: 1em;
        margin: 0 3px;
    }

    .writing-tools-top {
        display: flex;
        justify-content: flex-end;
    }

    .writing-tools {
        display: none;
    }

    #actions {
        display: flex;
        /* Use flexbox for horizontal arrangement that can wrap */
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        /* Distribute buttons */
        padding: 10px;
        width: 100%;
        margin: 10px auto;
    }

    .button {
        font-size: 1em;
        padding: 0.8em 0.5em;
        /* Adjust padding for smaller screens */
        margin: 5px;
        /* Add some margin for spacing */
        display: inline-block;
        /* Allow buttons to sit side by side and wrap */

        /* Two buttons per row with spacing */
        box-sizing: border-box;
        /* Include padding and border in width */
        text-align: center;
    }

    #numbers {
        width: 100%;
        gap: 0;
        margin: 15px auto;
        margin-top: -1em;
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
    }

    .eraser {
        width: 95%;
    }

    .number {
        flex-basis: calc(33.33% - 10px);
        margin: 2px;
        font-size: 1em;
        border-radius: 5px;
    }

    #clearCellButton {
        width: 80%;
        margin: 15px auto;
        display: block;
        padding: 0.8em;
        font-size: 1em;
        border-radius: 5px;
    }

    .v-dialog {
        width: 90% !important;
        max-width: 90% !important;
        margin: 30px auto;
        /* Add some top/bottom margin for dialogs */
    }
}

@media (max-width: 740px) {
    #board {
        width: 97vw;
    }
}

@media (max-width: 680px) {
    #board {
        width: 98vw;
    }
}

@media (max-width: 670px) {
    #board {
        width: 99vw;
    }
}

@media (max-width: 660px) {
    #board {
        width: 100vw;
    }
}

/* Further adjustments for very small screens (optional) */
@media (max-width: 480px) {
    .number {
        font-size: 0.9em;
        padding: 0.7em 0.4em;
        margin: 3px;
        flex-basis: calc(33.33% - 6px);
    }

    .button {
        font-size: 0.9em;
        padding: 0.7em;
    }

    #clearCellButton {
        font-size: 0.9em;
        padding: 0.7em;
        width: 70%;
    }
}
</style>